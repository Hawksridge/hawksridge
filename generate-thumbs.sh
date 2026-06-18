#!/bin/bash
# Generate gallery image sizes:
#   - thumbs/ : 900px wide, for the grid display (sized for retina/HiDPI)
#   - large/  : 1600px wide, for the stacked/single-column view

cd "$(dirname "$0")/images"
mkdir -p thumbs large

shopt -s nullglob
for img in *.jpg *.JPG *.jpeg *.JPEG; do
    if [ ! -f "thumbs/$img" ] || [ "$img" -nt "thumbs/$img" ]; then
        echo "Creating thumbnail (900px): $img"
        sips -Z 900 "$img" --out "thumbs/$img" 2>/dev/null
    fi
    if [ ! -f "large/$img" ] || [ "$img" -nt "large/$img" ]; then
        echo "Creating large (1600px): $img"
        sips -Z 1600 "$img" --out "large/$img" 2>/dev/null
    fi
done

echo "Done! Thumbnails in images/thumbs/ (900px), large in images/large/ (1600px)"
