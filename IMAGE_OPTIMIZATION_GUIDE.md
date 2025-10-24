# Image Optimization Guide

## Overview
This guide documents the image optimization system implemented for SGeX Workbench to reduce file sizes and improve loading performance.

## Summary
Successfully generated scaled versions of 37 large PNG files (>200KB) in the project, resulting in:
- **Mobile**: ~93% file size reduction
- **Desktop**: ~74% file size reduction

## Generated Files
- **Total scaled images**: 76 files
  - 38 desktop versions (600px width) 
  - 38 mobile versions (300px width)
- All mobile versions are under 200KB ✅
- Desktop versions range from 291KB to 580KB

## File Naming Convention
For each original image (e.g., `image.png`), the following versions are created:
- `image_600.png` - Desktop version (600px width)
- `image_300.png` - Mobile version (300px width)
- `image_grey_tabby_600.png` - Desktop dark mode version
- `image_grey_tabby_300.png` - Mobile dark mode version

## Sample File Size Comparisons

| File | Original | Desktop (600px) | Mobile (300px) | Desktop Savings | Mobile Savings |
|------|----------|-----------------|----------------|-----------------|----------------|
| sgex-mascot.png | 3.7MB | 380KB | 100KB | 89% | 97% |
| authoring.png | 2.0MB | 564KB | 132KB | 72% | 93% |
| collaboration.png | 2.0MB | 580KB | 144KB | 71% | 92% |
| dak_interventions.png | 1.8MB | 528KB | 108KB | 71% | 94% |
| pronunciation-guide.png | 3.7MB | 380KB | 100KB | 89% | 97% |

## How It Works

### Automatic Image Selection
The `useThemeImage` hook (`src/hooks/useThemeImage.js`) automatically:
1. Detects screen size (< 768px = mobile, >= 768px = desktop)
2. Detects current theme (light/dark mode)
3. Serves the appropriately scaled and themed image
4. Responds to window resizes and theme changes

### Browser Behavior
- **Mobile screens (<768px)**: Loads 300px versions (~75-144KB each)
- **Desktop screens (>=768px)**: Loads 600px versions (~291-580KB each)
- **Dark mode**: Automatically uses `_grey_tabby` variants
- **Retina displays**: 600px images remain sharp on high-DPI screens

## Regenerating Scaled Images

### When to Regenerate
Regenerate scaled images when:
- New PNG images are added to `public/` directory
- Existing images are updated
- Image quality needs adjustment

### How to Regenerate

1. **Install ImageMagick** (if not already installed):
   ```bash
   sudo apt-get install imagemagick
   ```

2. **Run the generation script**:
   ```bash
   ./scripts/generate-scaled-images.sh
   ```

3. **Review the output** to ensure all images were processed correctly

4. **Commit the new scaled images**:
   ```bash
   git add public/**/*_300.png public/**/*_600.png
   git commit -m "Regenerate scaled images"
   ```

### Customizing Image Sizes

To change the target sizes, edit `scripts/generate-scaled-images.sh`:
```bash
DESKTOP_WIDTH=600   # Change this value for desktop size
MOBILE_WIDTH=300    # Change this value for mobile size
```

## Technical Details

### Image Generation Settings
- **Tool**: ImageMagick
- **Quality**: 85% compression
- **Scaling**: Proportional (maintains aspect ratio)
- **Format**: PNG with optimization

### Code Implementation

1. **Script**: `scripts/generate-scaled-images.sh`
   - Finds all PNG files over 200KB
   - Generates 600px and 300px versions
   - Creates both light and dark theme variants
   - Provides detailed output with file sizes

2. **Hook**: `src/hooks/useThemeImage.js`
   - Monitors screen size via `window.innerWidth`
   - Listens for window resize events
   - Observes theme changes via MutationObserver
   - Returns appropriate image path

### Component Usage
Components use the hook like this:
```javascript
import useThemeImage from '../hooks/useThemeImage';

const MyComponent = () => {
  const imagePath = useThemeImage('my-image.png');
  return <img src={imagePath} alt="My Image" />;
};
```

The hook handles all the complexity of selecting the right image variant.

## Performance Impact

### Bandwidth Savings
For a typical user viewing the DAK Dashboard with 9 component cards:
- **Before**: ~14MB (9 cards × ~1.5MB average)
- **After (Mobile)**: ~900KB (9 cards × ~100KB average)  
- **After (Desktop)**: ~3.6MB (9 cards × ~400KB average)

### Loading Time Improvements
- **Mobile (3G)**: ~85 seconds → ~6 seconds (93% faster)
- **Desktop (Cable)**: ~3 seconds → ~0.8 seconds (73% faster)

## Original Files
All original PNG files are retained in the repository for:
- Future regeneration if needed
- Reference for quality comparison
- Archival purposes

## Browser Compatibility
The responsive image loading works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

### Automated Tests
Existing tests continue to work because:
- Tests mock the `useThemeImage` hook
- Mock returns test image paths
- No changes needed to test files

### Manual Testing Checklist
To verify image optimization:
- [ ] Open DevTools Network tab
- [ ] Navigate to DAK Dashboard
- [ ] Verify mobile versions load on small screens (<768px)
- [ ] Verify desktop versions load on large screens (>=768px)
- [ ] Toggle theme and verify `_grey_tabby` variants load
- [ ] Check that images look sharp and clear
- [ ] Resize window and verify images switch appropriately

### Performance Testing
To measure actual bandwidth savings:
1. Clear browser cache
2. Open DevTools Network tab
3. Navigate to a page with many images
4. Check total transferred data
5. Compare with expected sizes

## Troubleshooting

### Images Not Loading
If scaled images fail to load:
1. Check browser console for 404 errors
2. Verify scaled images exist in `public/` directory
3. Run build and check `build/` directory for images
4. Verify correct naming convention is used

### Quality Issues
If images appear blurry or pixelated:
1. Adjust quality setting in generation script
2. Increase target size (e.g., 800px for desktop)
3. Regenerate images with new settings

### Theme Switch Issues
If dark mode images don't load:
1. Verify `_grey_tabby` variants exist
2. Check browser console for errors
3. Test the `useThemeImage` hook directly

## Future Improvements
Potential enhancements:
- [ ] Add WebP format support for better compression
- [ ] Implement lazy loading for off-screen images
- [ ] Add srcset/picture element support
- [ ] Create automated CI/CD image optimization pipeline
- [ ] Add visual regression testing

## Related Files
- `scripts/generate-scaled-images.sh` - Image generation script
- `src/hooks/useThemeImage.js` - Responsive image selection hook
- `public/*.png` - Original and scaled images
- `.github/workflows/*.yml` - CI/CD configuration (future)
