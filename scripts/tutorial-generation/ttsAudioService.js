/**
 * Text-to-Speech Audio Generation Service
 * Uses eSpeak NG for offline multilingual audio generation
 */

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class TTSAudioService {
  constructor() {
    this.supportedLanguages = {
      'en': { code: 'en', voice: 'en+f3', name: 'English' },
      'fr': { code: 'fr', voice: 'fr+f2', name: 'French' },
      'es': { code: 'es', voice: 'es+f2', name: 'Spanish' },
      'ar': { code: 'ar', voice: 'ar+f1', name: 'Arabic' },
      'zh': { code: 'zh', voice: 'zh+f1', name: 'Chinese' },
      'ru': { code: 'ru', voice: 'ru+f2', name: 'Russian' }
    };
    
    this.audioOutputDir = path.join(process.cwd(), 'audio');
    this.ensureDirectoriesExist();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectoriesExist() {
    if (!fs.existsSync(this.audioOutputDir)) {
      fs.mkdirSync(this.audioOutputDir, { recursive: true });
    }

    // Create language subdirectories
    Object.keys(this.supportedLanguages).forEach(lang => {
      const langDir = path.join(this.audioOutputDir, lang);
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }
    });
  }

  /**
   * Check if eSpeak NG is available
   */
  async checkESpeakAvailability() {
    try {
      execSync('espeak-ng --version', { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.warn('eSpeak NG not found. Please install eSpeak NG for audio generation.');
      return false;
    }
  }

  /**
   * Get available eSpeak voices
   */
  async getAvailableVoices() {
    try {
      const output = execSync('espeak-ng --voices', { encoding: 'utf8' });
      return this.parseVoicesOutput(output);
    } catch (error) {
      console.error('Failed to get eSpeak voices:', error.message);
      return [];
    }
  }

  /**
   * Parse eSpeak voices output
   */
  parseVoicesOutput(output) {
    const lines = output.split('\n').slice(1); // Skip header
    const voices = [];
    
    lines.forEach(line => {
      if (line.trim()) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          voices.push({
            priority: parts[0],
            language: parts[1],
            gender: parts[2],
            name: parts[3],
            fullLine: line.trim()
          });
        }
      }
    });
    
    return voices;
  }

  /**
   * Generate audio for a text string
   */
  async generateAudio(text, language = 'en', outputFile = null, options = {}) {
    if (!await this.checkESpeakAvailability()) {
      throw new Error('eSpeak NG not available');
    }

    const langConfig = this.supportedLanguages[language];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Generate output filename if not provided
    if (!outputFile) {
      const timestamp = Date.now();
      const sanitizedText = text.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-');
      outputFile = path.join(this.audioOutputDir, language, `${timestamp}-${sanitizedText}.wav`);
    }

    // eSpeak NG options
    const espeakOptions = {
      voice: options.voice || langConfig.voice,
      speed: options.speed || 150, // Words per minute
      pitch: options.pitch || 50,  // 0-99
      amplitude: options.amplitude || 100, // 0-200
      gap: options.gap || 10, // Gap between words in 10ms units
      ...options
    };

    // Build eSpeak command
    const command = [
      'espeak-ng',
      `-v "${espeakOptions.voice}"`,
      `-s ${espeakOptions.speed}`,
      `-p ${espeakOptions.pitch}`,
      `-a ${espeakOptions.amplitude}`,
      `-g ${espeakOptions.gap}`,
      `-w "${outputFile}"`,
      `"${text.replace(/"/g, '\\"')}"`
    ].join(' ');

    try {
      console.log(`Generating audio: ${command}`);
      execSync(command, { stdio: 'pipe' });
      
      // Get audio duration
      const duration = await this.getAudioDuration(outputFile);
      
      console.log(`Generated audio: ${outputFile} (${duration}ms)`);
      
      return {
        success: true,
        outputFile,
        duration,
        language,
        text,
        size: fs.statSync(outputFile).size
      };
    } catch (error) {
      console.error(`Failed to generate audio for "${text}":`, error.message);
      throw new Error(`Audio generation failed: ${error.message}`);
    }
  }

  /**
   * Generate audio for multiple texts
   */
  async generateBatchAudio(textItems, language = 'en', options = {}) {
    const results = [];
    
    for (let i = 0; i < textItems.length; i++) {
      const item = textItems[i];
      const text = typeof item === 'string' ? item : item.text;
      const id = typeof item === 'string' ? `step-${i + 1}` : (item.id || `step-${i + 1}`);
      
      try {
        const outputFile = path.join(this.audioOutputDir, language, `${id}.wav`);
        const result = await this.generateAudio(text, language, outputFile, options);
        results.push({
          id,
          text,
          ...result
        });
      } catch (error) {
        console.error(`Failed to generate audio for item ${i + 1}:`, error.message);
        results.push({
          id,
          text,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Generate audio from feature file narrations
   */
  async generateFeatureAudio(featureFile, languages = ['en'], options = {}) {
    const narrations = this.extractNarrationsFromFeature(featureFile);
    const results = {};
    
    for (const language of languages) {
      console.log(`Generating audio for ${narrations.length} narrations in ${language}...`);
      
      // Get translated text if available
      const translatedNarrations = await this.getTranslatedNarrations(narrations, language);
      
      results[language] = await this.generateBatchAudio(translatedNarrations, language, options);
    }
    
    return results;
  }

  /**
   * Check if feature file contains narration keywords
   */
  hasNarrationKeywords(featureFilePath) {
    try {
      const content = fs.readFileSync(featureFilePath, 'utf8');
      const narrationKeywords = ['I say "', 'say "', 'narrate "', 'speak "'];
      
      return narrationKeywords.some(keyword => content.includes(keyword));
    } catch (error) {
      console.error(`Error reading feature file ${featureFilePath}:`, error.message);
      return false;
    }
  }

  /**
   * Extract narration steps from feature file
   */
  extractNarrationsFromFeature(featureFilePath) {
    const content = fs.readFileSync(featureFilePath, 'utf8');
    const lines = content.split('\n');
    const narrations = [];
    
    // Extended pattern matching for various narration keywords
    const narrationPatterns = [
      /When I say "([^"]+)"/,
      /And I say "([^"]+)"/,
      /Given I say "([^"]+)"/,
      /Then I say "([^"]+)"/,
      /I narrate "([^"]+)"/,
      /I speak "([^"]+)"/
    ];
    
    lines.forEach((line, index) => {
      for (const pattern of narrationPatterns) {
        const match = line.match(pattern);
        if (match) {
          narrations.push({
            id: `narration-${narrations.length + 1}`,
            text: match[1],
            lineNumber: index + 1,
            originalLine: line.trim()
          });
          break; // Only match first pattern per line
        }
      }
    });
    
    return narrations;
  }

  /**
   * Get translated narrations with fallback to English
   */
  async getTranslatedNarrations(narrations, language) {
    if (language === 'en') {
      return narrations;
    }
    
    // Check if translations exist for the requested language
    const translationsExist = await this.checkTranslationsExist(language);
    
    if (!translationsExist) {
      console.log(`Translations for ${language} not available - falling back to English`);
      return narrations;
    }
    
    // TODO: Integrate with SGEX i18n system for actual translations
    console.log(`Translation for ${language} not yet implemented - using English fallback`);
    return narrations;
  }

  /**
   * Check if translations exist for a language
   */
  async checkTranslationsExist(language) {
    // Check for i18n files in the SGEX project
    const i18nPath = path.join(process.cwd(), 'public', 'locales', language);
    return fs.existsSync(i18nPath);
  }

  /**
   * Get audio duration using ffprobe or sox
   */
  async getAudioDuration(audioFile) {
    try {
      // Try ffprobe first
      const output = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioFile}"`, { 
        encoding: 'utf8' 
      });
      const seconds = parseFloat(output.trim());
      return Math.round(seconds * 1000); // Return milliseconds
    } catch (error) {
      try {
        // Fallback to sox
        const output = execSync(`soxi -D "${audioFile}"`, { encoding: 'utf8' });
        const seconds = parseFloat(output.trim());
        return Math.round(seconds * 1000);
      } catch (soxError) {
        // Estimate based on text length (rough approximation)
        const textLength = fs.readFileSync(audioFile).length;
        return Math.max(2000, textLength * 10); // Very rough estimate
      }
    }
  }

  /**
   * Test TTS system with sample text
   */
  async testTTS(language = 'en') {
    const testText = 'Hello, this is a test of the text-to-speech system for SGEX Workbench tutorials.';
    
    try {
      const result = await this.generateAudio(testText, language);
      console.log('TTS test successful:', result);
      return result;
    } catch (error) {
      console.error('TTS test failed:', error.message);
      throw error;
    }
  }

  /**
   * Clean up audio files older than specified age
   */
  async cleanupOldAudio(maxAgeMs = 24 * 60 * 60 * 1000) { // Default: 24 hours
    const now = Date.now();
    let cleanedCount = 0;
    
    Object.keys(this.supportedLanguages).forEach(lang => {
      const langDir = path.join(this.audioOutputDir, lang);
      
      if (fs.existsSync(langDir)) {
        const files = fs.readdirSync(langDir);
        
        files.forEach(file => {
          const filePath = path.join(langDir, file);
          const stats = fs.statSync(filePath);
          
          if (now - stats.mtime.getTime() > maxAgeMs) {
            fs.unlinkSync(filePath);
            cleanedCount++;
            console.log(`Cleaned up old audio file: ${filePath}`);
          }
        });
      }
    });
    
    console.log(`Cleaned up ${cleanedCount} old audio files`);
    return cleanedCount;
  }

  /**
   * Get audio generation statistics
   */
  getStats() {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      languages: {}
    };
    
    Object.keys(this.supportedLanguages).forEach(lang => {
      const langDir = path.join(this.audioOutputDir, lang);
      const langStats = { files: 0, size: 0 };
      
      if (fs.existsSync(langDir)) {
        const files = fs.readdirSync(langDir);
        
        files.forEach(file => {
          const filePath = path.join(langDir, file);
          if (file.endsWith('.wav')) {
            const size = fs.statSync(filePath).size;
            langStats.files++;
            langStats.size += size;
          }
        });
      }
      
      stats.languages[lang] = langStats;
      stats.totalFiles += langStats.files;
      stats.totalSize += langStats.size;
    });
    
    return stats;
  }
}

module.exports = TTSAudioService;