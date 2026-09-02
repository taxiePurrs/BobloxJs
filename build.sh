#!/bin/bash

# Define paths matching your exact subfolder and file casing
PROJECT_DIR="BobloxJsEdition"
HTML_TEMPLATE="$PROJECT_DIR/Index.html"
IMAGE_DIR="$PROJECT_DIR/Textures"
OUTPUT_FILE="dist/index.html"

# Create a distribution directory at the root
mkdir -p dist

echo "Building single-file game..."

# 1. Initialize a Bash associative array to track images dynamically
declare -A IMAGE_MAP

# 2. Loop through standard PNG files and save them to the map
for img in "$IMAGE_DIR"/*.png; do
  if [ -f "$img" ]; then
    filename=$(basename "$img")
    
    # Convert image file to a single-line base64 string
    base64_str=$(base64 -w 0 "$img")
    
    # Store in map: Key = filename, Value = base64 data URI string
    IMAGE_MAP["$filename"]="data:image/png;base64,$base64_str"
  fi
done

# 3. Loop through PSD files, converting them via ImageMagick
for img in "$IMAGE_DIR"/*.psd; do
  if [ -f "$img" ]; then
    # Change extension to .png to match how the browser will reference it
    filename="$(basename "$img" .psd).png"
    
    # Convert PSD stream directly to base64 line using png32 to avoid webp format headers
    base64_str=$(convert "$img" png32:- | base64 -w 0)

    # Store in map (Overwrites the old .png value if the names match!)
    IMAGE_MAP["$filename"]="data:image/png;base64,$base64_str"
  fi
done

# 4. FIXED: Stream the image block directly to a temporary file on disk
# This completely bypasses the Linux command line size limit (ARG_MAX)
TEMP_SCRIPT_BLOCK="dist/images_block.tmp"
echo "<script>const IMAGES = {};" > "$TEMP_SCRIPT_BLOCK"

for filename in "${!IMAGE_MAP[@]}"; do
  data_uri="${IMAGE_MAP[$filename]}"
  echo "IMAGES[\"$filename\"] = \"$data_uri\";" >> "$TEMP_SCRIPT_BLOCK"
done

echo "</script>" >> "$TEMP_SCRIPT_BLOCK"

# 5. FIXED INJECTION: Awk reads the temporary file directly from disk
# We pass the PATH to the file, not the massive content string itself
awk '
  {
    print
    if ($0 ~ /<head>/) {
      while ((getline line < temp_file) > 0) {
        print line
      }
      close(temp_file)
    }
  }
' temp_file="$TEMP_SCRIPT_BLOCK" "$HTML_TEMPLATE" > "$OUTPUT_FILE"

# Clean up the temporary file
rm -f "$TEMP_SCRIPT_BLOCK"

echo "Successfully compiled game into $OUTPUT_FILE"
