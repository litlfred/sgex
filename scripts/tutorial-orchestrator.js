#!/usr/bin/env node

/**
 * Tutorial Generation Orchestrator
 * Main script to coordinate the multilingual screen recording tutorial generation
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const StepMappingService = require('./tutorial-generation/stepMappingService');
const TTSAudioService = require('./tutorial-generation/ttsAudioService');
const PlaywrightScriptGenerator = require('./tutorial-generation/playwrightScriptGenerator');
const VideoProcessor = require('./tutorial-generation/videoProcessor');

class TutorialOrchestrator {
  constructor(options = {}) {
    this.options = {
      featuresDir: path.join(process.cwd(), 'features'),
      outputDir: path.join(process.cwd(), 'tutorials'),
      audioDir: path.join(process.cwd(), 'audio'),
      scriptsDir: path.join(process.cwd(), 'scripts', 'playwright'),
      docsDir: path.join(process.cwd(), 'docs', 'user-journey'),
      languages: ['en', 'fr', 'es', 'ar', 'zh', 'ru'],
      baseUrl: 'http://localhost:3000/sgex',
      videoWidth: 1366,
      videoHeight: 768,
      videoFormat: 'mp4',
      verbose: false,
      ...options
    };

    this.ttsService = new TTSAudioService();
    this.scriptGenerator = new PlaywrightScriptGenerator();
    this.videoProcessor = new VideoProcessor();
    this.results = {
      features: [],
      audio: {},
      videos: {},
      documentation: [],
      errors: []
    };
  }

  /**
   * Main orchestration method
   */
  async run(featureNames = [], languages = this.options.languages) {
    console.log('🎬 Starting SGEX Tutorial Generation');
    console.log(`📁 Features: ${featureNames.length ? featureNames.join(', ') : 'all'}`);
    console.log(`🌐 Languages: ${languages.join(', ')}`);
    console.log(`📺 Resolution: ${this.options.videoWidth}x${this.options.videoHeight}`);
    console.log('');

    try {
      // Step 1: Validate prerequisites
      await this.validatePrerequisites();

      // Step 2: Discover and validate feature files
      const featureFiles = await this.discoverFeatureFiles(featureNames);
      
      // Step 3: Extract narrations from feature files
      const narrations = await this.extractNarrations(featureFiles);
      
      // Step 4: Generate TTS audio for all languages
      const audioResults = await this.generateAudio(narrations, languages);
      
      // Step 5: Generate Playwright scripts
      const scripts = await this.generatePlaywrightScripts(featureFiles, audioResults);
      
      // Step 6: Start local SGEX server
      const serverProcess = await this.startLocalServer();
      
      try {
        // Step 7: Record screen tutorials
        const recordings = await this.recordTutorials(featureFiles, audioResults);
        
        // Step 8: Process videos with audio overlay
        const processedVideos = await this.processVideos(recordings, audioResults, languages);
        
        // Step 9: Generate documentation
        const docs = await this.generateDocumentation(featureFiles, audioResults, languages);
        
        console.log('✅ Tutorial generation completed successfully!');
        this.printSummary();
        
      } finally {
        // Step 10: Clean up server
        await this.stopLocalServer(serverProcess);
      }
      
    } catch (error) {
      console.error('❌ Tutorial generation failed:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Validate that all required tools are available
   */
  async validatePrerequisites() {
    console.log('🔍 Validating prerequisites...');
    
    const requirements = [
      { command: 'node --version', name: 'Node.js' },
      { command: 'npm --version', name: 'npm' },
      { command: 'espeak-ng --version', name: 'eSpeak NG' },
      { command: 'ffmpeg -version', name: 'FFmpeg' },
    ];

    for (const req of requirements) {
      try {
        execSync(req.command, { stdio: 'pipe' });
        console.log(`  ✅ ${req.name} available`);
      } catch (error) {
        throw new Error(`❌ ${req.name} not found. Please install ${req.name} before running tutorial generation.`);
      }
    }

    // Check if SGEX build exists
    const buildPath = path.join(process.cwd(), 'build', 'index.html');
    if (!fs.existsSync(buildPath)) {
      console.log('  🔨 SGEX build not found, building...');
      execSync('npm run build', { stdio: 'inherit' });
    }
    console.log('  ✅ SGEX build available');

    // Check Playwright installation
    try {
      execSync('npx playwright --version', { stdio: 'pipe' });
      console.log('  ✅ Playwright available');
    } catch (error) {
      console.log('  📦 Installing Playwright...');
      execSync('npm install -D @playwright/test', { stdio: 'inherit' });
      execSync('npx playwright install chromium', { stdio: 'inherit' });
    }
  }

  /**
   * Discover feature files to process with narration filtering
   */
  async discoverFeatureFiles(featureNames = []) {
    console.log('📋 Discovering feature files...');
    
    if (!fs.existsSync(this.options.featuresDir)) {
      throw new Error(`Features directory not found: ${this.options.featuresDir}`);
    }

    const allFeatureFiles = fs.readdirSync(this.options.featuresDir)
      .filter(file => file.endsWith('.feature'))
      .map(file => path.join(this.options.featuresDir, file));

    let selectedFiles = allFeatureFiles;
    
    if (featureNames.length > 0) {
      selectedFiles = featureNames.map(name => {
        const fileName = name.endsWith('.feature') ? name : `${name}.feature`;
        const filePath = path.join(this.options.featuresDir, fileName);
        
        if (!fs.existsSync(filePath)) {
          throw new Error(`Feature file not found: ${filePath}`);
        }
        
        return filePath;
      });
    }

    // Filter out feature files that don't contain narration keywords
    const validFeatureFiles = selectedFiles.filter(featureFile => {
      const hasNarration = this.ttsService.hasNarrationKeywords(featureFile);
      if (!hasNarration) {
        console.log(`  ⚠️  Skipping ${path.basename(featureFile)} - no narration keywords found`);
      }
      return hasNarration;
    });

    if (validFeatureFiles.length === 0) {
      throw new Error('No feature files with narration keywords found. Feature files should contain steps like \'When I say "..."\' to generate tutorials.');
    }

    console.log(`  📄 Found ${validFeatureFiles.length} feature files with narration:`);
    validFeatureFiles.forEach(file => {
      console.log(`    • ${path.basename(file)}`);
    });

    this.results.features = validFeatureFiles;
    return validFeatureFiles;
  }

  /**
   * Extract narrations from all feature files
   */
  async extractNarrations(featureFiles) {
    console.log('🎙️ Extracting narrations...');
    
    const allNarrations = {};
    
    for (const featureFile of featureFiles) {
      const featureName = path.basename(featureFile, '.feature');
      const narrations = this.ttsService.extractNarrationsFromFeature(featureFile);
      
      allNarrations[featureName] = narrations;
      console.log(`  📝 ${featureName}: ${narrations.length} narrations`);
    }
    
    return allNarrations;
  }

  /**
   * Generate TTS audio for all narrations in all languages
   */
  async generateAudio(narrations, languages) {
    console.log('🎵 Generating TTS audio...');
    
    const audioResults = {};
    
    for (const [featureName, featureNarrations] of Object.entries(narrations)) {
      audioResults[featureName] = {};
      
      for (const language of languages) {
        console.log(`  🔊 Generating ${language} audio for ${featureName}...`);
        
        try {
          const results = await this.ttsService.generateBatchAudio(
            featureNarrations, 
            language,
            { speed: 150, pitch: 50, amplitude: 100 }
          );
          
          audioResults[featureName][language] = results;
          const successCount = results.filter(r => r.success).length;
          console.log(`    ✅ ${successCount}/${results.length} audio files generated`);
          
        } catch (error) {
          console.error(`    ❌ Failed to generate ${language} audio for ${featureName}:`, error.message);
          this.results.errors.push(`Audio generation failed for ${featureName} (${language}): ${error.message}`);
          audioResults[featureName][language] = [];
        }
      }
    }
    
    this.results.audio = audioResults;
    return audioResults;
  }

  /**
   * Generate Playwright test scripts
   */
  async generatePlaywrightScripts(featureFiles, audioResults) {
    console.log('🎭 Generating Playwright scripts...');
    
    const scripts = [];
    
    for (const featureFile of featureFiles) {
      const featureName = path.basename(featureFile, '.feature');
      const audioClips = audioResults[featureName] || {};
      
      try {
        console.log(`  📜 Generating script for ${featureName}...`);
        const scriptPath = await this.scriptGenerator.generateScript(featureFile, audioClips);
        scripts.push(scriptPath);
        console.log(`    ✅ Script generated: ${path.basename(scriptPath)}`);
      } catch (error) {
        console.error(`    ❌ Failed to generate script for ${featureName}:`, error.message);
        this.results.errors.push(`Script generation failed for ${featureName}: ${error.message}`);
      }
    }
    
    return scripts;
  }

  /**
   * Start local SGEX server for recording
   */
  async startLocalServer() {
    console.log('🚀 Starting local SGEX server...');
    
    const buildDir = path.join(process.cwd(), 'build');
    
    if (!fs.existsSync(buildDir)) {
      throw new Error('Build directory not found. Run npm run build first.');
    }

    const serverProcess = spawn('python3', ['-m', 'http.server', '3000'], {
      cwd: buildDir,
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkServer = () => {
        attempts++;
        
        try {
          execSync('curl -s http://localhost:3000/sgex/ > /dev/null', { stdio: 'pipe' });
          console.log('  ✅ Server started on http://localhost:3000/sgex/');
          resolve();
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(new Error('Server failed to start within timeout'));
          } else {
            setTimeout(checkServer, 1000);
          }
        }
      };
      
      setTimeout(checkServer, 1000);
    });

    return serverProcess;
  }

  /**
   * Stop local server
   */
  async stopLocalServer(serverProcess) {
    if (serverProcess) {
      console.log('🛑 Stopping local server...');
      serverProcess.kill();
    }
  }

  /**
   * Record screen tutorials using Playwright
   */
  async recordTutorials(featureFiles, audioResults) {
    console.log('🎬 Recording screen tutorials...');
    
    const recordings = {};
    
    // For this implementation, we'll create a simplified recording approach
    // In a full implementation, this would use the generated Playwright scripts
    
    for (const featureFile of featureFiles) {
      const featureName = path.basename(featureFile, '.feature');
      
      try {
        console.log(`  📹 Recording ${featureName}...`);
        
        // Create a basic recording using Playwright
        const recordingPath = await this.createBasicRecording(featureName, audioResults[featureName]);
        recordings[featureName] = recordingPath;
        
        console.log(`    ✅ Recording completed: ${recordingPath}`);
      } catch (error) {
        console.error(`    ❌ Failed to record ${featureName}:`, error.message);
        this.results.errors.push(`Recording failed for ${featureName}: ${error.message}`);
      }
    }
    
    return recordings;
  }

  /**
   * Create a basic screen recording
   */
  async createBasicRecording(featureName, audioData) {
    const recordingDir = path.join('recordings', featureName);
    if (!fs.existsSync(recordingDir)) {
      fs.mkdirSync(recordingDir, { recursive: true });
    }

    const recordingPath = path.join(recordingDir, `${featureName}-recording.webm`);
    
    // Create a simple Playwright recording script
    const recordingScript = `
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: ${this.options.videoWidth}, height: ${this.options.videoHeight} },
    recordVideo: { dir: '${recordingDir}', size: { width: ${this.options.videoWidth}, height: ${this.options.videoHeight} } }
  });
  
  const page = await context.newPage();
  await page.goto('${this.options.baseUrl}');
  await page.waitForLoadState('networkidle');
  
  // Simulate tutorial interactions
  const narrations = ${JSON.stringify(audioData?.en || [])};
  
  for (const narration of narrations) {
    console.log('Narration:', narration.text?.substring(0, 50) + '...');
    await page.waitForTimeout(narration.duration || 3000);
    
    // Add some visual movement
    await page.mouse.move(Math.random() * 200 + 100, Math.random() * 200 + 100);
  }
  
  await context.close();
  await browser.close();
})();
`;

    const scriptPath = path.join(recordingDir, 'record.js');
    fs.writeFileSync(scriptPath, recordingScript);
    
    // Execute the recording
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    
    // Find the generated video file
    const videoFiles = fs.readdirSync(recordingDir).filter(f => f.endsWith('.webm'));
    if (videoFiles.length > 0) {
      return path.join(recordingDir, videoFiles[0]);
    }
    
    throw new Error('No video file generated');
  }

  /**
   * Process videos with audio overlay
   */
  async processVideos(recordings, audioResults, languages) {
    console.log('🎞️ Processing videos with audio overlay...');
    
    const processedVideos = {};
    
    for (const [featureName, recordingPath] of Object.entries(recordings)) {
      processedVideos[featureName] = {};
      
      for (const language of languages) {
        try {
          console.log(`  🔄 Processing ${featureName} in ${language}...`);
          
          const outputPath = await this.processVideoWithAudio(
            featureName, 
            recordingPath, 
            audioResults[featureName]?.[language] || [],
            language
          );
          
          processedVideos[featureName][language] = outputPath;
          console.log(`    ✅ Video processed: ${path.basename(outputPath)}`);
          
        } catch (error) {
          console.error(`    ❌ Failed to process ${featureName} in ${language}:`, error.message);
          this.results.errors.push(`Video processing failed for ${featureName} (${language}): ${error.message}`);
        }
      }
    }
    
    this.results.videos = processedVideos;
    return processedVideos;
  }

  /**
   * Process a single video with audio overlay
   */
  async processVideoWithAudio(featureName, recordingPath, audioClips, language) {
    // Simplified structure: tutorials/{feature}-{language}.mp4
    const outputDir = this.options.outputDir;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${featureName}-${language}.mp4`);
    
    if (audioClips.length === 0 || !recordingPath || !fs.existsSync(recordingPath)) {
      // Just convert the recording to MP4 without audio
      execSync(`ffmpeg -y -i "${recordingPath}" -c:v libx264 "${outputPath}"`, { stdio: 'pipe' });
      return outputPath;
    }

    // Create audio playlist and combine
    const audioFiles = audioClips.filter(clip => clip.success && fs.existsSync(clip.outputFile));
    
    if (audioFiles.length > 0) {
      const tempDir = path.join(outputDir, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const audioListPath = path.join(tempDir, `${featureName}-${language}-audio-list.txt`);
      const audioListContent = audioFiles.map(clip => `file '${path.resolve(clip.outputFile)}'`).join('\n');
      fs.writeFileSync(audioListPath, audioListContent);
      
      const combinedAudioPath = path.join(tempDir, `${featureName}-${language}-combined-audio.wav`);
      execSync(`ffmpeg -y -f concat -safe 0 -i "${audioListPath}" -c copy "${combinedAudioPath}"`, { stdio: 'pipe' });
      
      // Combine video with audio
      execSync([
        'ffmpeg', '-y',
        `-i "${recordingPath}"`,
        `-i "${combinedAudioPath}"`,
        '-c:v libx264',
        '-c:a aac',
        '-shortest',
        `"${outputPath}"`
      ].join(' '), { stdio: 'pipe' });
      
      // Clean up temporary files
      fs.unlinkSync(combinedAudioPath);
      fs.unlinkSync(audioListPath);
    } else {
      // No audio available, just convert video
      execSync(`ffmpeg -y -i "${recordingPath}" -c:v libx264 "${outputPath}"`, { stdio: 'pipe' });
    }
    
    return outputPath;
  }

  /**
   * Generate comprehensive documentation
   */
  async generateDocumentation(featureFiles, audioResults, languages) {
    console.log('📚 Generating documentation...');
    
    if (!fs.existsSync(this.options.docsDir)) {
      fs.mkdirSync(this.options.docsDir, { recursive: true });
    }

    const docs = [];
    
    for (const featureFile of featureFiles) {
      const featureName = path.basename(featureFile, '.feature');
      
      try {
        const docPath = await this.generateFeatureDocumentation(featureFile, audioResults[featureName], languages);
        docs.push(docPath);
        console.log(`  📄 Generated documentation: ${path.basename(docPath)}`);
      } catch (error) {
        console.error(`  ❌ Failed to generate docs for ${featureName}:`, error.message);
      }
    }
    
    // Generate index documentation
    await this.generateIndexDocumentation(featureFiles, languages);
    
    this.results.documentation = docs;
    return docs;
  }

  /**
   * Generate documentation for a single feature
   */
  async generateFeatureDocumentation(featureFile, audioResults, languages) {
    const featureName = path.basename(featureFile, '.feature');
    const featureContent = fs.readFileSync(featureFile, 'utf8');
    
    // Parse the feature to extract chaining information
    const feature = this.scriptGenerator.parseFeatureFile(featureFile);
    const featureChaining = feature.chaining;
    
    const titleMatch = featureContent.match(/Feature:\s*(.+)/);
    const featureTitle = titleMatch ? titleMatch[1].trim() : featureName;
    
    let docContent = `# ${featureTitle}\n\n`;
    docContent += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    // Add tutorial links
    docContent += `## 🎬 Tutorials\n\n`;
    languages.forEach(lang => {
      const langName = { en: 'English', fr: 'French', es: 'Spanish', ar: 'Arabic', zh: 'Chinese', ru: 'Russian' }[lang] || lang;
      docContent += `- [${langName} Tutorial](../../tutorials/${featureName}-${lang}.mp4)\n`;
      docContent += `- [${langName} Player](../../tutorials/${featureName}-${lang}.html)\n`;
    });
    
    // Add chaining navigation if available
    if (featureChaining && (featureChaining.next || featureChaining.previous)) {
      docContent += `\n## 🔗 Tutorial Chain\n\n`;
      if (featureChaining.previous) {
        docContent += `⬅️ **Previous**: [${featureChaining.previous}](${featureChaining.previous}.md)\n\n`;
      }
      if (featureChaining.next) {
        docContent += `➡️ **Next**: [${featureChaining.next}](${featureChaining.next}.md)\n\n`;
      }
    }
    
    // Add audio files
    docContent += `\n## 🎙️ Audio Narration\n\n`;
    languages.forEach(lang => {
      const langName = { en: 'English', fr: 'French', es: 'Spanish', ar: 'Arabic', zh: 'Chinese', ru: 'Russian' }[lang] || lang;
      const clips = audioResults?.[lang] || [];
      
      if (clips.length > 0) {
        docContent += `### ${langName}\n`;
        clips.forEach((clip, index) => {
          if (clip.success) {
            docContent += `${index + 1}. [${clip.id}.wav](../../${clip.outputFile}) - "${clip.text}"\n`;
          }
        });
        docContent += '\n';
      }
    });
    
    // Add source references
    docContent += `## 📄 Source Materials\n\n`;
    docContent += `- [Feature File](../../features/${featureName}.feature)\n`;
    docContent += `- [Playwright Script](../../scripts/playwright/${featureName}.spec.js)\n\n`;
    
    const docPath = path.join(this.options.docsDir, `${featureName}.md`);
    fs.writeFileSync(docPath, docContent);
    
    return docPath;
  }

  /**
   * Generate index documentation
   */
  async generateIndexDocumentation(featureFiles, languages) {
    let indexContent = `# SGEX Workbench Tutorial Library\n\n`;
    indexContent += `**Generated:** ${new Date().toISOString()}\n\n`;
    indexContent += `This library contains automatically generated multilingual screen recording tutorials for SGEX Workbench.\n\n`;
    
    indexContent += `## Available Tutorials\n\n`;
    featureFiles.forEach(featureFile => {
      const featureName = path.basename(featureFile, '.feature');
      const featureContent = fs.readFileSync(featureFile, 'utf8');
      const titleMatch = featureContent.match(/Feature:\s*(.+)/);
      const featureTitle = titleMatch ? titleMatch[1].trim() : featureName;
      
      indexContent += `- [${featureTitle}](${featureName}.md)\n`;
    });
    
    indexContent += `\n## Languages\n\n`;
    languages.forEach(lang => {
      const langName = { en: 'English', fr: 'French', es: 'Spanish', ar: 'Arabic', zh: 'Chinese', ru: 'Russian' }[lang] || lang;
      indexContent += `- ${langName} (${lang})\n`;
    });
    
    const indexPath = path.join(this.options.docsDir, 'README.md');
    fs.writeFileSync(indexPath, indexContent);
    
    return indexPath;
  }

  /**
   * Print generation summary
   */
  printSummary() {
    console.log('\n📊 Generation Summary:');
    console.log(`  📄 Features processed: ${this.results.features.length}`);
    
    const audioCount = Object.values(this.results.audio).reduce((total, feature) => {
      return total + Object.values(feature).reduce((subtotal, lang) => subtotal + lang.length, 0);
    }, 0);
    console.log(`  🎵 Audio files generated: ${audioCount}`);
    
    const videoCount = Object.values(this.results.videos).reduce((total, feature) => {
      return total + Object.keys(feature).length;
    }, 0);
    console.log(`  🎬 Videos created: ${videoCount}`);
    
    console.log(`  📚 Documentation files: ${this.results.documentation.length}`);
    
    if (this.results.errors.length > 0) {
      console.log(`  ⚠️  Errors encountered: ${this.results.errors.length}`);
      this.results.errors.forEach(error => console.log(`    • ${error}`));
    }
    
    console.log('\n🎉 Tutorial generation completed!');
    console.log(`📁 Check the 'tutorials/' directory for generated content`);
    console.log(`📖 See 'docs/user-journey/README.md' for usage instructions`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  const featureNames = [];
  const languages = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--features' && i + 1 < args.length) {
      featureNames.push(...args[++i].split(','));
    } else if (arg === '--languages' && i + 1 < args.length) {
      languages.push(...args[++i].split(','));
    } else if (arg === '--base-url' && i + 1 < args.length) {
      options.baseUrl = args[++i];
    } else if (arg === '--resolution' && i + 1 < args.length) {
      const [width, height] = args[++i].split('x').map(Number);
      options.videoWidth = width;
      options.videoHeight = height;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--help') {
      console.log(`
SGEX Tutorial Generation Orchestrator

Usage: node tutorial-orchestrator.js [options]

Options:
  --features <names>    Comma-separated list of feature names (default: all)
  --languages <codes>   Comma-separated list of language codes (default: en,fr,es,ar,zh,ru)
  --base-url <url>      Base URL for SGEX (default: http://localhost:3000/sgex)
  --resolution <WxH>    Video resolution (default: 1280x720)
  --verbose             Enable verbose logging
  --help                Show this help message

Examples:
  node tutorial-orchestrator.js
  node tutorial-orchestrator.js --features user-login-pat,profile-selection-dak-scanning
  node tutorial-orchestrator.js --languages en,fr,es --resolution 1920x1080
      `);
      process.exit(0);
    }
  }
  
  const orchestrator = new TutorialOrchestrator(options);
  orchestrator.run(featureNames, languages.length > 0 ? languages : undefined)
    .catch(error => {
      console.error('❌ Tutorial generation failed:', error.message);
      process.exit(1);
    });
}

module.exports = TutorialOrchestrator;