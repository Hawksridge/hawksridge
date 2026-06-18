#!/bin/bash
# Generate 900px wide thumbnails for gallery grid display (sized for retina/HiDPI)

cd "$(dirname "$0")/images"
mkdir -p thumbs

shopt -s nullglob
for img in *.jpg *.JPG *.jpeg *.JPEG; do
    if [ ! -f "thumbs/$img" ] || [ "$img" -nt "thumbs/$img" ]; then
        echo "Creating thumbnail: $img"
        sips -Z 900 "$img" --out "thumbs/$img" 2>/dev/null
    fi
done

echo "Done! Thumbnails are in images/thumbs/"
