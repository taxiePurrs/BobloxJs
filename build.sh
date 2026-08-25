#!/bin/bash

# Define files and directories
HTML_TEMPLATE="index.html"
JS_FILE="game.js" # Change this to your javascript filename
IMAGE_DIR="images" # Change this to your images folder name
OUTPUT_FILE="dist/index.html"

# Create a distribution directory
mkdir -p dist

# 1. Read the original HTML structure up until the script tag
# (Assuming your template has basic HTML structure)
cat $HTML_TEMPLATE > $OUTPUT_FILE

# 2. Open an inline style or script tag block
echo "<script>" >> $OUTPUT_FILE

# 3. Create a dictionary/mapping object in JavaScript for your images
echo "const IMAGES = {};" >> $OUTPUT_FILE

# 4. Loop through all your local .png files and convert them to Base64
echo "Encoding PNG images into the single file..."
for img in "$IMAGE_DIR"/*.png; do
  if [ -f "$img" ]; then
    filename=$(basename "$img")
    
    # Convert image file to a single-line base64 string
    base64_str=$(base64 -w 0 "$img")
    
    # Store it in the JavaScript object using the filename as the key
    echo "IMAGES[\"$filename\"] = \"data:image/png;base64,$base64_str\";" >> $OUTPUT_FILE
  fi
done

# 5. Inject your game logic file
cat $JS_FILE >> $OUTPUT_FILE

# 6. Close the script tag
echo "</script>" >> $OUTPUT_FILE

echo "Successfully compiled game into $OUTPUT_FILE"
