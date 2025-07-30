# SGEX Internationalization (i18n) Documentation

## Overview

SGEX Workbench now supports internationalization and localization using react-i18next with support for .po (gettext) files and integration with translation platforms.

## Features

- **Multi-language Support**: Currently supports English (US), French, and Spanish
- **Default Locale**: en_US (English - United States)
- **Language Selector**: Optional UI component for users to switch languages
- **Gettext (.po) File Support**: Compatible with standard gettext translation files
- **Translation Platform Integration**: Ready for integration with popular translation services
- **Persistent Language Selection**: User's language choice is saved in browser storage

## Current Supported Languages

| Language | Code | Flag | Status |
|----------|------|------|--------|
| English (US) | en-US | 🇺🇸 | ✅ Complete |
| French | fr-FR | 🇫🇷 | ✅ Complete |
| Spanish | es-ES | 🇪🇸 | ✅ Complete |

## Quick Start

The internationalization system is automatically initialized when the application starts. Users can switch languages using the language selector in the top-right corner of the interface.

### For Developers

1. **Adding new translatable text**:
   ```jsx
   import { useTranslation } from 'react-i18next';
   
   function MyComponent() {
     const { t } = useTranslation();
     
     return (
       <div>
         <h1>{t('my.new.key')}</h1>
         <p>{t('my.description', { name: 'SGEX' })}</p>
       </div>
     );
   }
   ```

2. **Add translations to JSON files**:
   - `src/locales/en_US/translation.json`
   - `src/locales/fr_FR/translation.json`
   - `src/locales/es_ES/translation.json`

## File Structure

```
src/
├── i18n.js                         # i18n configuration
├── locales/
│   ├── en_US/
│   │   └── translation.json        # English translations
│   ├── fr_FR/
│   │   └── translation.json        # French translations
│   └── es_ES/
│       └── translation.json        # Spanish translations
└── components/
    └── LanguageSelector.js         # Language switching component
```

## Configuration

The i18n system is configured in `src/i18n.js` with the following key settings:

- **Default language**: en-US
- **Fallback language**: en-US
- **Language detection**: Browser language, localStorage, sessionStorage
- **Debugging**: Enabled in development mode

## Translation Key Organization

Translations are organized by namespace and context:

```json
{
  "app": {
    "title": "SGEX Workbench",
    "subtitle": "WHO SMART Guidelines Exchange"
  },
  "navigation": {
    "documentation": "📖 Documentation",
    "logout": "Logout"
  },
  "landing": {
    "welcome": "Welcome to SGEX Workbench",
    "description": "A browser-based, standards-compliant..."
  },
  "errors": {
    "user_not_found": "Could not access the requested DAK. User '{{user}}' not found."
  }
}
```

## Working with .po Files

### Converting JSON to .po Files

You can convert the JSON translation files to .po format using tools like `i18next-conv`:

```bash
npm install -g i18next-conv

# Convert JSON to .po
i18next-conv -l en -s src/locales/en_US/translation.json -t src/locales/en_US/translation.po

# Convert .po back to JSON
i18next-conv -l en -s src/locales/en_US/translation.po -t src/locales/en_US/translation.json
```

### .po File Format Example

```po
# English translations for SGEX Workbench
msgid ""
msgstr ""
"Language: en-US\n"
"Content-Type: text/plain; charset=UTF-8\n"

msgid "app.title"
msgstr "SGEX Workbench"

msgid "app.subtitle"
msgstr "WHO SMART Guidelines Exchange"

msgid "landing.welcome"
msgstr "Welcome to SGEX Workbench"
```

## Translation Platform Integration

The system is designed to work with popular translation platforms:

### Crowdin Integration

1. Create a `crowdin.yml` configuration file:
   ```yaml
   project_id: "your-project-id"
   api_token: "your-api-token"
   
   files:
     - source: /src/locales/en_US/translation.json
       translation: /src/locales/%two_letters_code%_%two_letters_code_upper%/translation.json
   ```

2. Upload source files: `crowdin upload sources`
3. Download translations: `crowdin download`

### Lokalise Integration

1. Install Lokalise CLI: `npm install -g @lokalise/cli`
2. Upload keys: `lokalise2 file upload --file="src/locales/en_US/translation.json" --lang-iso=en`
3. Download translations: `lokalise2 file download --format=json --original-filenames=false`

### Weblate Integration

1. Set up webhook for automatic updates
2. Configure repository integration
3. Use Weblate's REST API for programmatic access

## Adding New Languages

To add support for a new language:

1. **Create translation directory**:
   ```bash
   mkdir src/locales/de_DE  # German example
   ```

2. **Create translation file**:
   ```bash
   cp src/locales/en_US/translation.json src/locales/de_DE/translation.json
   ```

3. **Translate the content** in the new file

4. **Update i18n configuration** in `src/i18n.js`:
   ```javascript
   // Add to resources
   'de-DE': {
     translation: deTranslations
   }
   
   // Add to supportedLngs
   supportedLngs: ['en-US', 'fr-FR', 'es-ES', 'de-DE']
   ```

5. **Update LanguageSelector component** to include the new language option

## Language Selector Component

The `LanguageSelector` component provides a dropdown interface for users to switch languages.

### Usage

```jsx
import LanguageSelector from './components/LanguageSelector';

// Default usage (top-right position)
<LanguageSelector />

// Custom positioning
<LanguageSelector position="top-left" showLabel={true} />

// Inline usage
<LanguageSelector position="inline" />
```

### Props

- `position`: 'top-right' | 'top-left' | 'inline' (default: 'top-right')
- `showLabel`: boolean (default: true) - Show "Language:" label

## Best Practices

1. **Use descriptive keys**: `landing.welcome` instead of `text1`
2. **Group related translations**: Use nested objects for organization
3. **Handle pluralization**: Use i18next pluralization features
4. **Test all languages**: Ensure UI layout works with longer translations
5. **Use interpolation**: For dynamic content like `{{username}}`
6. **Provide context**: Add comments in .po files for translators

## Browser Compatibility

The internationalization system works in all modern browsers that support:
- ES6 modules
- Local Storage
- Session Storage
- Fetch API (for loading translation files)

## Performance Considerations

- Translation files are loaded on demand
- Language changes are cached in browser storage
- Fallback language (en-US) is always available
- Bundle size impact is minimal (~20KB for react-i18next)

## Troubleshooting

### Common Issues

1. **Missing translations**: Check browser console for missing key warnings
2. **Language not switching**: Verify language code matches supportedLngs
3. **Layout issues**: Some languages may require more space for text
4. **Special characters**: Ensure files are saved with UTF-8 encoding

### Debug Mode

Enable debug mode in development by setting `debug: true` in `src/i18n.js`. This will log:
- Language changes
- Missing translation keys
- Namespace loading
- Resource loading status

## Future Enhancements

Planned improvements for the internationalization system:

1. **RTL Language Support**: For Arabic, Hebrew, etc.
2. **Context-based Translations**: Different translations based on user role
3. **Automatic Translation Detection**: Using browser/system preferences
4. **Lazy Loading**: Load translations only when needed
5. **Translation Validation**: Automated checks for missing keys
6. **Regional Variants**: Support for en-GB, fr-CA, etc.