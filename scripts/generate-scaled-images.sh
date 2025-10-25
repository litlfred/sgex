#!/bin/bash

# Script to generate scaled versions of large PNG images for desktop and mobile
# Usage: ./scripts/generate-scaled-images.sh

set -e -o pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🖼️  Generating scaled image versions..."
echo ""

# Target sizes
DESKTOP_WIDTH=600   # For desktop displays (retina-ready at ~300px display)
MOBILE_WIDTH=300    # For mobile displays (~150px display)

# Counter for processed images
processed=0
skipped=0
errors=0

# Find all PNG files larger than 200KB and store in array
mapfile -t png_files < <(find public -name "*.png" -size +200k -type f | sort)

# Process each file
for original_file in "${png_files[@]}"; do
    # Get file size in KB for reporting
    file_size=$(du -k "$original_file" | cut -f1)
    
    # Extract directory, filename without extension, and extension
    dir=$(dirname "$original_file")
    filename=$(basename "$original_file")
    name="${filename%.*}"
    ext="${filename##*.}"
    
    # Skip if this is already a scaled version
    if [[ "$name" =~ _[0-9]+$ ]]; then
        echo -e "${YELLOW}⏭️  Skipping already scaled: $filename${NC}"
        skipped=$((skipped + 1))
        continue
    fi
    
    echo -e "${GREEN}📐 Processing: $original_file (${file_size}KB)${NC}"
    
    # Get original dimensions
    dimensions=$(identify -format "%wx%h" "$original_file")
    echo "   Original size: $dimensions"
    
    # Generate desktop version (600px width)
    desktop_file="${dir}/${name}_600.${ext}"
    if [ -f "$desktop_file" ]; then
        echo "   ⏭️  Desktop version already exists: $desktop_file"
    else
        echo "   🖥️  Creating desktop version (${DESKTOP_WIDTH}px wide)..."
        convert "$original_file" -resize "${DESKTOP_WIDTH}x" -quality 85 "$desktop_file"
        desktop_size=$(du -k "$desktop_file" | cut -f1)
        echo "   ✅ Created: $desktop_file (${desktop_size}KB)"
    fi
    
    # Generate mobile version (300px width)
    mobile_file="${dir}/${name}_300.${ext}"
    if [ -f "$mobile_file" ]; then
        echo "   ⏭️  Mobile version already exists: $mobile_file"
    else
        echo "   📱 Creating mobile version (${MOBILE_WIDTH}px wide)..."
        convert "$original_file" -resize "${MOBILE_WIDTH}x" -quality 85 "$mobile_file"
        mobile_size=$(du -k "$mobile_file" | cut -f1)
        echo "   ✅ Created: $mobile_file (${mobile_size}KB)"
    fi
    
    echo ""
    processed=$((processed + 1))
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Complete!${NC}"
echo "   Processed: $processed images"
echo "   Skipped: $skipped images"
if [ $errors -gt 0 ]; then
    echo -e "   ${RED}Errors: $errors${NC}"
fi
echo ""
echo "📊 Generating size report..."

# Generate a report of file sizes
echo ""
echo "Original vs Scaled Sizes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

find public -name "*.png" -size +200k -type f | while read -r file; do
    dir=$(dirname "$file")
    filename=$(basename "$file")
    name="${filename%.*}"
    ext="${filename##*.}"
    
    # Skip already scaled versions
    if [[ "$name" =~ _[0-9]+$ ]]; then
        continue
    fi
    
    orig_size=$(du -h "$file" | cut -f1)
    desktop_file="${dir}/${name}_600.${ext}"
    mobile_file="${dir}/${name}_300.${ext}"
    
    if [ -f "$desktop_file" ] && [ -f "$mobile_file" ]; then
        desktop_size=$(du -h "$desktop_file" | cut -f1)
        mobile_size=$(du -h "$mobile_file" | cut -f1)
        echo "📄 $filename:"
        echo "   Original: $orig_size"
        echo "   Desktop (600px): $desktop_size"
        echo "   Mobile (300px): $mobile_size"
        echo ""
    fi
done

echo "✅ All scaled images have been generated!"
