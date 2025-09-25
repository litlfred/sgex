# SGEX Multilingual Tutorial Generation System

This document describes the automated multilingual screen recording tutorial system for SGEX Workbench.

## Overview

The tutorial generation system automatically creates narrated screen recordings from Gherkin feature files in multiple languages. It leverages:

- **Gherkin Feature Files**: User scenario descriptions in Given/When/Then format
- **eSpeak NG**: Open-source text-to-speech for multilingual narration
- **Playwright**: Browser automation for screen recording
- **FFmpeg**: Video/audio processing and caption generation
- **GitHub Actions**: Automated CI/CD pipeline

## Architecture

```
Feature Files (.feature)
    ↓
Narration Extraction
    ↓
TTS Audio Generation (6 languages)
    ↓
Playwright Script Generation
    ↓
Screen Recording
    ↓
Video/Audio Processing
    ↓
Documentation Generation
```

## Directory Structure

```
sgex/
├── features/                          # Gherkin feature files
│   ├── user-login-pat.feature
│   ├── profile-selection-dak-scanning.feature
│   └── help-mascot-documentation.feature
├── scripts/
│   ├── tutorial-orchestrator.js       # Main orchestration script
│   └── tutorial-generation/           # Core services
│       ├── stepMappingService.js      # Gherkin → Playwright mapping
│       ├── ttsAudioService.js         # Text-to-speech generation
│       ├── playwrightScriptGenerator.js # Script generation
│       ├── globalSetup.js             # Playwright setup
│       └── globalTeardown.js          # Playwright cleanup
├── audio/                             # Generated TTS audio files
│   ├── en/                           # English audio
│   ├── fr/                           # French audio
│   ├── es/                           # Spanish audio
│   ├── ar/                           # Arabic audio
│   ├── zh/                           # Chinese audio
│   └── ru/                           # Russian audio
├── tutorials/                         # Final video outputs
│   └── {feature}/                    # Per-feature directories
│       ├── en/                       # English videos
│       │   ├── {feature}-en.mp4
│       │   └── {feature}-en.srt
│       └── {lang}/                   # Other language videos
├── docs/user-journey/                 # Generated documentation
└── .github/workflows/
    └── multilingual-tutorial-generation.yml # GitHub Actions workflow
```

## Usage

### Local Development

1. **Install Dependencies**:
   ```bash
   # System dependencies
   sudo apt-get install espeak-ng ffmpeg sox
   
   # Node.js dependencies
   npm install
   npm install -D @playwright/test
   npx playwright install chromium
   ```

2. **Generate Tutorials**:
   ```bash
   # Generate all tutorials in all languages
   node scripts/tutorial-orchestrator.js
   
   # Generate specific features
   node scripts/tutorial-orchestrator.js --features user-login-pat,profile-selection-dak-scanning
   
   # Generate in specific languages
   node scripts/tutorial-orchestrator.js --languages en,fr,es
   
   # Custom resolution
   node scripts/tutorial-orchestrator.js --resolution 1920x1080
   ```

3. **View Results**:
   - Videos: `tutorials/{feature}/{language}/{feature}-{language}.mp4`
   - Audio: `audio/{language}/{feature}-*.wav`
   - Documentation: `docs/user-journey/README.md`

### GitHub Actions

The automated workflow can be triggered manually with custom parameters:

1. Go to **Actions** → **Generate Multilingual Screen Recording Tutorials**
2. Click **Run workflow**
3. Configure options:
   - **Feature files**: `all` or comma-separated list
   - **Target branch**: Branch to build SGEX from (default: `main`)
   - **Languages**: Comma-separated language codes (default: `en,fr,es`)
   - **Include captions**: Enable SRT caption generation
   - **Video quality**: `720p` or `1080p`

### Required Secrets

For GitHub Actions, configure the `GH_PAT` secret:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add **New repository secret**:
   - **Name**: `GH_PAT`
   - **Value**: Your GitHub Personal Access Token with `repo` and `workflow` scopes

## Feature File Format

Feature files use Gherkin syntax with special narration steps:

```gherkin
Feature: User PAT Login Process
  As a new user of SGEX Workbench
  I want to authenticate using a Personal Access Token
  So that I can access GitHub repositories

  Background:
    Given I am on the SGEX Workbench landing page
    And I am not currently logged in

  Scenario: User successfully logs in with PAT
    When I say "Welcome to SGEX Workbench! Let me show you how to log in."
    And I navigate to the login page
    When I say "First, we need to click on the Sign In button."
    And I click the "Sign In" button
    When I say "Now we see the PAT login form."
    And I see the PAT login form
    # ... more steps
```

### Narration Steps

Use `When I say "..."` for narration that becomes audio:

- **Text-to-speech**: Converted to audio in all target languages
- **Timing**: Playwright waits for audio duration before next action
- **Captions**: Used for SRT subtitle generation

### Action Steps

Standard Gherkin steps are mapped to Playwright actions:

- `I navigate to the {page} page`
- `I click the "{element}"`
- `I enter "{text}" in the {field} field`
- `I see the {element}`
- `I wait for {condition}`

## Supported Languages

The system supports the 6 UN languages:

| Code | Language | eSpeak Voice | Status |
|------|----------|--------------|--------|
| `en` | English  | `en+f3`      | ✅ Tested |
| `fr` | French   | `fr+f2`      | ✅ Tested |
| `es` | Spanish  | `es+f2`      | ✅ Tested |
| `ar` | Arabic   | `ar+f1`      | ⚠️ Basic |
| `zh` | Chinese  | `zh+f1`      | ⚠️ Basic |
| `ru` | Russian  | `ru+f2`      | ⚠️ Basic |

## Integration with SGEX

### Translation System

The tutorial generation integrates with SGEX's existing i18n infrastructure:

- **Extraction**: Narration text extracted for translation
- **Templates**: Generated `.pot` files for translators
- **Localization**: Uses existing translation workflow
- **Runtime**: Supports dynamic language switching

### Page Framework

Step mapping leverages SGEX's page framework:

- **Routing**: Uses existing URL patterns and navigation
- **Selectors**: Integrates with component `data-testid` attributes
- **Context**: Maintains authentication and application state

### Development Workflow

- **Feature Development**: Add `.feature` files alongside code changes
- **PR Integration**: Tutorials auto-generate on merge to main
- **Documentation**: Tutorials linked from main SGEX documentation

## Troubleshooting

### Common Issues

1. **eSpeak Not Found**:
   ```bash
   sudo apt-get install espeak-ng espeak-ng-data
   ```

2. **FFmpeg Missing**:
   ```bash
   sudo apt-get install ffmpeg
   ```

3. **Playwright Browser Issues**:
   ```bash
   npx playwright install --with-deps chromium
   ```

4. **Server Not Starting**:
   - Ensure SGEX builds successfully: `npm run build`
   - Check port 3000 is available
   - Verify `build/index.html` exists

### Audio Issues

- **Voice Quality**: Adjust eSpeak parameters in `ttsAudioService.js`
- **Timing**: Modify duration estimation in step mapping
- **Languages**: Check eSpeak language pack installation

### Video Issues

- **Resolution**: Ensure consistent viewport settings
- **Performance**: Reduce video quality for faster processing
- **Sync**: Verify audio clip durations match video timing

## Development

### Adding New Features

1. **Create Feature File**: Add `.feature` file in `features/` directory
2. **Add Step Mappings**: Extend `stepMappingService.js` if needed
3. **Test Locally**: Run tutorial generation locally
4. **Update Documentation**: Add to user journey docs

### Extending Step Mappings

To add new Gherkin step patterns:

```javascript
// In stepMappingService.js
this.stepMappings.set(/^I perform new action "([^"]+)"$/, this.newActionHandler.bind(this));

async newActionHandler(match, stepText) {
  const actionTarget = match[1];
  // Implement action logic
  return { success: true, action: `Performed new action: ${actionTarget}` };
}
```

### Language Support

To add new languages:

1. **eSpeak Voice**: Verify voice availability
2. **Language Config**: Add to `supportedLanguages` in `ttsAudioService.js`
3. **i18n Integration**: Add translation infrastructure
4. **Testing**: Validate audio generation

## Performance Considerations

- **Parallel Processing**: Disabled during recording for consistency
- **Caching**: Audio files cached between runs
- **Cleanup**: Automatic cleanup of old files
- **Optimization**: Video compression for web delivery

## Future Enhancements

- **Interactive Tutorials**: Clickable hotspots in videos
- **Voice Customization**: Multiple voice options per language
- **Real-time Demos**: Live tutorial generation
- **Analytics**: Usage tracking and feedback collection
- **Mobile Support**: Responsive tutorial layouts

## Contributing

1. **Feature Requests**: Add issues with tutorial requirements
2. **Bug Reports**: Include feature file and error logs
3. **Language Support**: Help with translation and voice testing
4. **Documentation**: Update guides and examples

For detailed API documentation, see the individual service files in `scripts/tutorial-generation/`.