# Build Scripts

## copy-lforms.js

This script copies LHC-Forms library files from the npm package to the public directory as static assets.

**Purpose**: Replaces CDN-based loading with local bundle for improved reliability and self-contained deployment.

**Usage**: 
- Automatically run during `npm run build` (via prebuild script)
- Can be run manually with `npm run copy-lforms`

**Source**: `node_modules/lforms/dist/`
**Target**: `public/vendor/lforms/`

**Files copied**:
- Complete webcomponent bundle (main.js, lhc-forms.js, etc.)
- FHIR R4 integration (lformsFHIR.js)  
- CSS styles (lforms-styles.css)

The vendor files are excluded from git via .gitignore and regenerated on each build.