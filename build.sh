#!/bin/bash

# Define paths matching your exact subfolder and file casing
PROJECT_DIR="BobloxJsEdition"
HTML_TEMPLATE="$PROJECT_DIR/Index.html"
IMAGE_DIR="$PROJECT_DIR/Textures"
OUTPUT_FILE="dist/index.html"

# Create a distribution directory at the root
mkdir -p dist

echo "Building single-file game..."

# 1. Start building the image object variable block
IMAGE_BLOCK="<script>const IMAGES = {};"

# 2. Loop through PNG files inside BobloxJsEdition/Textures and append them to the string
for img in "$IMAGE_DIR"/*.png; do
  if [ -f "$img" ]; then
    filename=$(basename "$img")
    
    # Convert image file to a single-line base64 string
    base64_str=$(base64 -w 0 "$img")

    echo "$base64_str"
    
    # Append the image key/value pair to our script block string
    IMAGE_BLOCK="$IMAGE_BLOCK IMAGES[\"$filename\"] = \"data:image/png;base64,$base64_str\";"
  fi  
done

for img in "$IMAGE_DIR"/*.psd; do
  if [ -f "$img" ]; then
    filename="$(basename "$img" .psd).png"
    
    base64_str=$(convert "$img" $filename | base64 -w 0)

    echo "$base64_str"

    IMAGE_BLOCK="$IMAGE_BLOCK IMAGES[\"$filename\"] = \"data:image/png;base64,$base64_str\";"
  fi
done

# Close the image script block tag
IMAGE_BLOCK="$IMAGE_BLOCK</script>"

# 3. Inject the image data right after the opening <head> tag of your Index.html template
# This ensures IMAGES is defined before any of your body or script tags execute.
export IMAGE_BLOCK
awk '
  {
    print
    if ($0 ~ /<head>/) {
      print env["IMAGE_BLOCK"]
    }
  }
' env_eval="IMAGE_BLOCK" IMAGE_BLOCK="$IMAGE_BLOCK" "$HTML_TEMPLATE" > "$OUTPUT_FILE"

echo "Successfully compiled game into $OUTPUT_FILE"
