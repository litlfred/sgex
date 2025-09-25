import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from './framework';
import githubService from '../services/githubService';
import ContextualHelpMascot from './ContextualHelpMascot';
import './LocalTutorialManager.css';

const LocalTutorialManager = () => {
  const { t } = useTranslation();
  const [features, setFeatures] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [languages, setLanguages] = useState(['en']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [releases, setReleases] = useState([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Available languages for tutorial generation
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' }
  ];

  useEffect(() => {
    loadTutorialData();
  }, []);

  const loadTutorialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load feature files from the repository
      const featuresData = await loadFeatureFiles();
      setFeatures(featuresData);

      // Load existing tutorial files from local tutorials directory
      const tutorialsData = await loadLocalTutorials();
      setTutorials(tutorialsData);

      // Load GitHub releases that contain tutorials
      const releasesData = await loadTutorialReleases();
      setReleases(releasesData);

    } catch (err) {
      console.error('Error loading tutorial data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFeatureFiles = async () => {
    try {
      // Get current repository context
      const repoInfo = githubService.getCurrentRepository();
      if (!repoInfo) {
        throw new Error('No repository context available. Please authenticate and select a repository first.');
      }

      // Try to fetch feature files from the features directory
      const featuresContent = await githubService.getFileContent(
        repoInfo.owner,
        repoInfo.name,
        'features',
        repoInfo.branch || 'main'
      );

      if (featuresContent && Array.isArray(featuresContent)) {
        const featureFiles = featuresContent
          .filter(item => item.name.endsWith('.feature'))
          .map(item => ({
            name: item.name,
            path: item.path,
            hasNarration: false, // We'll check this when content is loaded
            description: item.name.replace('.feature', '').replace(/-/g, ' ')
          }));

        // Check each feature file for narration keywords
        for (const feature of featureFiles) {
          try {
            const content = await githubService.getFileContent(
              repoInfo.owner,
              repoInfo.name,
              feature.path,
              repoInfo.branch || 'main'
            );
            
            if (content && typeof content === 'string') {
              feature.hasNarration = /\b(say|narrate|speak)\b/i.test(content);
              feature.content = content;
            }
          } catch (err) {
            console.warn(`Could not load content for ${feature.name}:`, err);
          }
        }

        return featureFiles.filter(f => f.hasNarration);
      }

      return [];
    } catch (error) {
      console.error('Error loading feature files:', error);
      return [];
    }
  };

  const loadLocalTutorials = async () => {
    try {
      // In a browser environment, we can't directly access the local filesystem
      // Instead, we'll check for tutorial files in the repository's tutorials directory
      const repoInfo = githubService.getCurrentRepository();
      if (!repoInfo) return [];

      try {
        const tutorialsContent = await githubService.getFileContent(
          repoInfo.owner,
          repoInfo.name,
          'tutorials',
          repoInfo.branch || 'main'
        );

        if (tutorialsContent && Array.isArray(tutorialsContent)) {
          const tutorialFiles = tutorialsContent
            .filter(item => item.name.endsWith('.mp4'))
            .map(item => ({
              name: item.name,
              path: item.path,
              size: item.size,
              lastModified: item.last_modified || new Date().toISOString()
            }));

          return tutorialFiles;
        }
      } catch (err) {
        // tutorials directory might not exist yet
        console.info('No tutorials directory found - this is normal for new repositories');
      }

      return [];
    } catch (error) {
      console.error('Error loading local tutorials:', error);
      return [];
    }
  };

  const loadTutorialReleases = async () => {
    try {
      const repoInfo = githubService.getCurrentRepository();
      if (!repoInfo) return [];

      const releases = await githubService.getRepositoryReleases(
        repoInfo.owner,
        repoInfo.name
      );

      // Filter releases that contain tutorial videos
      const tutorialReleases = releases
        .filter(release => 
          release.tag_name.startsWith('tutorial-v') || 
          release.assets.some(asset => asset.name.endsWith('.mp4'))
        )
        .map(release => ({
          id: release.id,
          tagName: release.tag_name,
          name: release.name,
          publishedAt: release.published_at,
          assets: release.assets.filter(asset => 
            asset.name.endsWith('.mp4') || 
            asset.name.endsWith('.srt') ||
            asset.name.endsWith('.html')
          )
        }));

      return tutorialReleases;
    } catch (error) {
      console.error('Error loading tutorial releases:', error);
      return [];
    }
  };

  const handleFeatureSelection = (featureName, selected) => {
    if (selected) {
      setSelectedFeatures([...selectedFeatures, featureName]);
    } else {
      setSelectedFeatures(selectedFeatures.filter(f => f !== featureName));
    }
  };

  const handleLanguageSelection = (langCode, selected) => {
    if (selected) {
      setLanguages([...languages, langCode]);
    } else {
      setLanguages(languages.filter(l => l !== langCode));
    }
  };

  const generateTutorials = async () => {
    if (selectedFeatures.length === 0) {
      alert('Please select at least one feature file to generate tutorials for.');
      return;
    }

    if (languages.length === 0) {
      alert('Please select at least one language for tutorial generation.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Starting tutorial generation...');

    try {
      // Since we can't run browser-based screen recording easily,
      // we'll create a guide for manual tutorial generation
      setGenerationProgress('Creating tutorial generation guide...');
      
      const tutorialGuide = generateTutorialGuide(selectedFeatures, languages);
      
      setGenerationProgress('Tutorial generation guide created. Check the console for details.');
      
      // Display the guide to the user
      console.log('=== TUTORIAL GENERATION GUIDE ===');
      console.log(tutorialGuide);
      
      // Create a downloadable guide file
      const blob = new Blob([tutorialGuide], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tutorial-generation-guide-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setGenerationProgress('Tutorial generation guide downloaded. Follow the instructions to create videos locally.');
      
      // Refresh tutorial list
      setTimeout(loadTutorialData, 1000);
      
    } catch (error) {
      console.error('Error generating tutorials:', error);
      setGenerationProgress(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTutorialGuide = (selectedFeatures, languages) => {
    const repoInfo = githubService.getCurrentRepository();
    const repoUrl = `https://github.com/${repoInfo.owner}/${repoInfo.name}`;
    const branch = repoInfo.branch || 'main';
    
    return `# SGEX Tutorial Generation Guide

Generated on: ${new Date().toISOString()}
Repository: ${repoUrl}
Branch: ${branch}
Selected Features: ${selectedFeatures.join(', ')}
Languages: ${languages.map(l => availableLanguages.find(al => al.code === l)?.name || l).join(', ')}

## Prerequisites

Before generating tutorials, ensure you have the following installed on your local machine:

### System Dependencies
\`\`\`bash
# Install eSpeak NG for text-to-speech
sudo apt-get update
sudo apt-get install -y espeak-ng espeak-ng-data

# Install FFmpeg for video processing
sudo apt-get install -y ffmpeg

# Install additional audio tools
sudo apt-get install -y sox libsox-fmt-all
\`\`\`

### Node.js Dependencies
\`\`\`bash
# Install Playwright for screen recording
npm install -D @playwright/test

# Install Gherkin parser
npm install -D @cucumber/gherkin

# Install browsers
npx playwright install chromium
\`\`\`

## Local Generation Process

### Step 1: Clone the Repository Locally
\`\`\`bash
git clone ${repoUrl}.git
cd ${repoInfo.name}
git checkout ${branch}
npm install
\`\`\`

### Step 2: Start Local Development Server
\`\`\`bash
npm start
# Server will run on http://localhost:3000/sgex
\`\`\`

### Step 3: Generate Tutorials
Run the tutorial generation command with your selected features and languages:

\`\`\`bash
# Generate tutorials for selected features
npm run tutorial:generate -- --features ${selectedFeatures.join(',')} --languages ${languages.join(',')}

# Or generate individual features:
${selectedFeatures.map(feature => `npm run tutorial:generate-local -- --features ${feature} --languages ${languages.join(',')}`).join('\n')}
\`\`\`

### Step 4: Review Generated Content

After generation, you'll find the following in your local directory:

\`\`\`
tutorials/
├── ${selectedFeatures.map(f => `${f}-${languages[0]}.mp4`).join('\n├── ')}
${languages.length > 1 ? `├── ${selectedFeatures.map(f => languages.slice(1).map(l => `${f}-${l}.mp4`).join('\n├── ')).join('\n├── ')}` : ''}
audio/
├── ${languages.map(l => `${l}/\n│   ├── ${selectedFeatures.map(f => `${f}-narration-*.wav`).join('\n│   ├── ')}`).join('\n├── ')}
docs/
└── user-journey/
    ├── ${selectedFeatures.map(f => `${f}.md`).join('\n    ├── ')}
    └── README.md
\`\`\`

### Step 5: Test and Validate

1. **Test Videos**: Play each generated video to ensure quality
2. **Check Audio**: Verify narration timing and clarity
3. **Review Documentation**: Ensure all documentation is accurate
4. **Size Check**: Verify videos are appropriately compressed (target: 5-15 MB each)

### Step 6: Upload to GitHub Releases

Once satisfied with the tutorial quality, you can upload them to GitHub:

1. **Create Release**: Use the "Upload to GitHub" button in the SGEX Tutorial Manager
2. **Or Manual Upload**: 
   \`\`\`bash
   # Create a new release
   gh release create tutorial-v\$(date +%Y%m%d-%H%M) tutorials/*.mp4 tutorials/*.srt docs/user-journey/README.md
   \`\`\`

## Feature Files to Process

${selectedFeatures.map(feature => {
  const featureData = features.find(f => f.name === feature + '.feature');
  return `### ${feature}
**File**: features/${feature}.feature
**Description**: ${featureData?.description || feature.replace(/-/g, ' ')}
**Has Narration**: ${featureData?.hasNarration ? '✅' : '❌'}

${featureData?.content ? `**Content Preview**:
\`\`\`gherkin
${featureData.content.split('\n').slice(0, 10).join('\n')}${featureData.content.split('\n').length > 10 ? '\n...' : ''}
\`\`\`
` : ''}`;
}).join('\n\n')}

## Language Configuration

${languages.map(lang => {
  const langInfo = availableLanguages.find(al => al.code === lang);
  return `### ${langInfo?.name || lang} (${lang})
- **eSpeak Voice**: ${getESpeakVoice(lang)}
- **TTS Speed**: 150 words per minute
- **Output Format**: WAV, 44.1kHz`;
}).join('\n\n')}

## Troubleshooting

### Common Issues

1. **eSpeak not found**: Install eSpeak NG using the commands above
2. **Playwright browser not found**: Run \`npx playwright install chromium\`
3. **FFmpeg not found**: Install FFmpeg using package manager
4. **Permission denied**: Ensure you have write permissions to the tutorials directory

### Support

- **Repository Issues**: ${repoUrl}/issues
- **SGEX Documentation**: Check the public/docs/ directory
- **Video Size Too Large**: Adjust compression settings in the video processor

## Next Steps

1. Follow the generation process above
2. Test all generated tutorials
3. Use the SGEX Tutorial Manager to upload to GitHub releases
4. Update documentation with new tutorial links

---
*This guide was generated by SGEX Tutorial Manager on ${new Date().toLocaleDateString()}*
`;
  };

  const getESpeakVoice = (langCode) => {
    const voiceMap = {
      'en': 'en+f3',
      'fr': 'fr+f2', 
      'es': 'es+f2',
      'ar': 'ar+f1',
      'zh': 'zh+f1',
      'ru': 'ru+f2'
    };
    return voiceMap[langCode] || 'en+f3';
  };

  const uploadToGitHub = async () => {
    try {
      setShowUploadDialog(true);
      setUploadStatus('Preparing upload...');

      // In a real implementation, this would:
      // 1. Package local tutorial files
      // 2. Create a GitHub release
      // 3. Upload tutorial assets to the release
      
      setUploadStatus('GitHub upload functionality requires local file system access. Please use the CLI tools or GitHub web interface to upload tutorial files.');
      
    } catch (error) {
      console.error('Error uploading to GitHub:', error);
      setUploadStatus(`Upload error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <PageLayout 
        title="Tutorial Manager"
        description="Generate and manage SGEX screen recording tutorials"
        className="tutorial-manager-page"
      >
        <div className="tutorial-manager-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading tutorial data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout 
        title="Tutorial Manager"
        description="Generate and manage SGEX screen recording tutorials"
        className="tutorial-manager-page"
      >
        <div className="tutorial-manager-container">
          <div className="error-state">
            <h3>Error Loading Tutorial Data</h3>
            <p>{error}</p>
            <button onClick={loadTutorialData} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Tutorial Manager"
      description="Generate and manage SGEX screen recording tutorials"
      className="tutorial-manager-page"
    >
      <div className="tutorial-manager-container">
        <div className="tutorial-manager-header">
          <h1>SGEX Tutorial Manager</h1>
          <p>Generate, manage, and upload screen recording tutorials for SGEX Workbench user journey scenarios.</p>
        </div>

        <div className="tutorial-sections">
          {/* Feature Selection */}
          <div className="tutorial-section">
            <h2>📁 Available Feature Files</h2>
            <div className="feature-selection">
              {features.length > 0 ? (
                features.map(feature => (
                  <div key={feature.name} className="feature-item">
                    <label className="feature-label">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature.name.replace('.feature', ''))}
                        onChange={(e) => handleFeatureSelection(feature.name.replace('.feature', ''), e.target.checked)}
                      />
                      <span className="feature-name">{feature.description}</span>
                      <span className="feature-file">({feature.name})</span>
                      {feature.hasNarration && <span className="narration-badge">🎙️ Has Narration</span>}
                    </label>
                  </div>
                ))
              ) : (
                <div className="no-features">
                  <p>No feature files with narration found in the repository.</p>
                  <p>Feature files should be located in the <code>features/</code> directory and contain narration keywords like "say", "narrate", or "speak".</p>
                </div>
              )}
            </div>
          </div>

          {/* Language Selection */}
          <div className="tutorial-section">
            <h2>🌍 Tutorial Languages</h2>
            <div className="language-selection">
              {availableLanguages.map(lang => (
                <label key={lang.code} className="language-label">
                  <input
                    type="checkbox"
                    checked={languages.includes(lang.code)}
                    onChange={(e) => handleLanguageSelection(lang.code, e.target.checked)}
                  />
                  <span className="language-name">{lang.name} ({lang.code})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Generation Controls */}
          <div className="tutorial-section">
            <h2>🎬 Tutorial Generation</h2>
            <div className="generation-controls">
              <button 
                onClick={generateTutorials}
                disabled={isGenerating || selectedFeatures.length === 0 || languages.length === 0}
                className="generate-button"
              >
                {isGenerating ? 'Generating...' : 'Generate Tutorial Guide'}
              </button>
              
              {isGenerating && (
                <div className="generation-progress">
                  <div className="progress-spinner"></div>
                  <p>{generationProgress}</p>
                </div>
              )}
              
              {!isGenerating && generationProgress && (
                <div className="generation-status">
                  <p>{generationProgress}</p>
                </div>
              )}
            </div>

            <div className="generation-info">
              <h3>How it works:</h3>
              <ol>
                <li><strong>Select Features:</strong> Choose which user scenarios to generate tutorials for</li>
                <li><strong>Choose Languages:</strong> Select narration languages for multilingual support</li>
                <li><strong>Generate Guide:</strong> Download a comprehensive guide for local tutorial generation</li>
                <li><strong>Local Generation:</strong> Follow the guide to generate videos on your local machine</li>
                <li><strong>Upload Results:</strong> Upload finished tutorials to GitHub releases for distribution</li>
              </ol>
            </div>
          </div>

          {/* Local Tutorials */}
          {tutorials.length > 0 && (
            <div className="tutorial-section">
              <h2>🎥 Local Tutorial Files</h2>
              <div className="tutorial-list">
                {tutorials.map(tutorial => (
                  <div key={tutorial.name} className="tutorial-item">
                    <span className="tutorial-name">{tutorial.name}</span>
                    <span className="tutorial-size">{(tutorial.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="tutorial-modified">{new Date(tutorial.lastModified).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
              <button onClick={uploadToGitHub} className="upload-button">
                📤 Upload to GitHub Releases
              </button>
            </div>
          )}

          {/* Published Releases */}
          {releases.length > 0 && (
            <div className="tutorial-section">
              <h2>🚀 Published Tutorial Releases</h2>
              <div className="releases-list">
                {releases.map(release => (
                  <div key={release.id} className="release-item">
                    <div className="release-header">
                      <h3>{release.name}</h3>
                      <span className="release-date">{new Date(release.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="release-assets">
                      {release.assets.map(asset => (
                        <a 
                          key={asset.id}
                          href={asset.browser_download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="asset-link"
                        >
                          {asset.name}
                          <span className="asset-size">({(asset.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload Dialog */}
        {showUploadDialog && (
          <div className="upload-dialog-overlay">
            <div className="upload-dialog">
              <div className="upload-dialog-header">
                <h3>Upload Tutorials to GitHub</h3>
                <button 
                  onClick={() => setShowUploadDialog(false)}
                  className="close-dialog-button"
                >
                  ×
                </button>
              </div>
              <div className="upload-dialog-content">
                <p>{uploadStatus}</p>
                <div className="upload-instructions">
                  <h4>Manual Upload Instructions:</h4>
                  <ol>
                    <li>Navigate to your repository's GitHub page</li>
                    <li>Go to "Releases" tab</li>
                    <li>Click "Create a new release"</li>
                    <li>Use tag format: <code>tutorial-v{new Date().getFullYear()}{(new Date().getMonth()+1).toString().padStart(2,'0')}{new Date().getDate().toString().padStart(2,'0')}</code></li>
                    <li>Upload your tutorial MP4, SRT, and documentation files</li>
                    <li>Publish the release</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ContextualHelpMascot 
        pageId="local-tutorial-manager"
        contextData={{
          featuresCount: features.length,
          tutorialsCount: tutorials.length,
          releasesCount: releases.length
        }}
      />
    </PageLayout>
  );
};

export default LocalTutorialManager;