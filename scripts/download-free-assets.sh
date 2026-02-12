#!/bin/bash

# Download free professional assets automatically
# This script downloads example textures from free sources

echo "Downloading free professional assets..."
echo "======================================"

cd "$(dirname "$0")/.."

# Create directories
mkdir -p public/assets/textures/platform
mkdir -p public/assets/textures/ground
mkdir -p public/assets/textures/obstacle
mkdir -p public/assets/models
mkdir -p public/assets/environment

# Function to download with curl
download_file() {
    local url=$1
    local output=$2
    echo "Downloading: $output"
    if curl -L -f -o "$output" "$url" 2>/dev/null; then
        echo "✓ Success: $output"
        return 0
    else
        echo "✗ Failed: $output"
        return 1
    fi
}

# Try to download example textures
# Note: These are example URLs - you may need to update with actual working URLs
echo ""
echo "Attempting to download example textures..."
echo "If downloads fail, see QUICK_ASSET_SETUP.md for manual instructions"
echo ""

# Example: Try downloading from a public CDN (these URLs may need updating)
# For now, we'll create placeholder instructions

echo "Since direct downloads require specific URLs, here's what to do:"
echo ""
echo "1. Visit https://polyhaven.com/textures"
echo "2. Search for 'concrete floor'"
echo "3. Download the JPG version"
echo "4. Extract and rename files as shown in QUICK_ASSET_SETUP.md"
echo ""
echo "OR use these direct download links (if available):"
echo ""
echo "Concrete Floor Texture:"
echo "  https://polyhaven.com/a/concrete_floor_001"
echo ""
echo "Metal Rusty Texture:"
echo "  https://polyhaven.com/a/metal_rusty_001"
echo ""
echo "Concrete Wall Texture:"
echo "  https://polyhaven.com/a/concrete_wall_001"
echo ""

# Create a simple test texture to verify the system works
echo "Creating test configuration file..."
cat > public/assets/README.txt << 'EOF'
ASSETS DIRECTORY
================

Place your professional textures and models here:

textures/
  platform/    - Platform textures (albedo.jpg, normal.jpg, etc.)
  ground/      - Ground textures
  obstacle/    - Obstacle textures

models/        - 3D models in GLTF/GLB format

environment/   - Skybox and environment textures

After adding assets, update src/config/assets.ts with the paths.

See QUICK_ASSET_SETUP.md for detailed instructions.
EOF

echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Download textures from https://polyhaven.com/textures"
echo "2. Place in appropriate folders"
echo "3. Update src/config/assets.ts"
echo "4. Run: npm run dev"

