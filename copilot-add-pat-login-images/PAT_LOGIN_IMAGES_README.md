# PAT Login Images - Replacement Required

## Current Status
The PAT login card currently uses placeholder images (copied from `sgex-mascot.png` and `sgex-mascot_grey_tabby.png`).

## Required Images
The following images need to be downloaded from the GitHub issue and saved in the `public/` directory:

### Light Mode Image
- **Source URL**: https://github.com/user-attachments/assets/eee86aa1-1a53-45cd-98e7-8c8f2a41023d
- **Target Filename**: `pat-login.png`
- **Description**: Light mode version - Cat holding PAT sign with beige/cream background

### Dark Mode Image  
- **Source URL**: https://github.com/user-attachments/assets/b2e3cb10-c991-4bae-aaa1-70f2492cb7cf
- **Target Filename**: `pat-login_grey_tabby.png`
- **Description**: Dark mode version - Orange/ginger cat holding PAT sign with warmer tones

## Image Specifications
- Format: PNG
- Recommended size: Similar to other card images (~2-4MB, high resolution)
- Naming convention:
  - Light mode: `pat-login.png`
  - Dark mode: `pat-login_grey_tabby.png`

## Installation Instructions
1. Download both images from the URLs above
2. Save them in the `public/` directory with the exact filenames specified
3. Replace the existing placeholder files
4. The `useThemeImage` hook will automatically switch between them based on theme

## Verification
After replacing the images:
1. Start the dev server: `npm start`
2. Navigate to the welcome page
3. Test in both light and dark modes (theme toggle in top-right)
4. Verify the correct image appears in each mode
5. Check responsive design on mobile and desktop viewports

## Current Implementation
The PAT login card image is displayed in `src/components/WelcomePage.js` using:
```javascript
const patLoginImage = useThemeImage('pat-login.png');
```

This automatically resolves to:
- Light mode: `/pat-login.png`
- Dark mode: `/pat-login_grey_tabby.png`
