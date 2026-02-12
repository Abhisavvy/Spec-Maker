#!/bin/bash

# Script to download professional free assets
# This script downloads free CC0 assets from Poly Haven

echo "Downloading professional game assets..."

# Create directories
mkdir -p public/assets/textures/platform
mkdir -p public/assets/textures/ground
mkdir -p public/assets/textures/obstacle
mkdir -p public/assets/models
mkdir -p public/assets/environment

# Download Poly Haven concrete texture (example - you can replace with actual URLs)
echo "Note: This script provides example URLs. You'll need to download assets manually or update URLs."
echo ""
echo "Recommended free asset sources:"
echo "1. Poly Haven: https://polyhaven.com/textures"
echo "2. Quaternius: https://quaternius.com/"
echo "3. Kenney.nl: https://kenney.nl/assets"
echo ""
echo "For Poly Haven textures:"
echo "1. Visit https://polyhaven.com/textures"
echo "2. Search for 'concrete' or 'metal'"
echo "3. Click on a texture"
echo "4. Download the JPG version"
echo "5. Extract and rename files:"
echo "   - diffuse.jpg -> albedo.jpg"
echo "   - normal.jpg -> normal.jpg"
echo "   - roughness.jpg -> roughness.jpg"
echo "   - metalness.jpg -> metallic.jpg"
echo "   - ao.jpg -> ao.jpg"
echo "6. Place in appropriate folders"
echo ""
echo "Example Poly Haven textures to download:"
echo "- Concrete 001: https://polyhaven.com/a/concrete_floor_001"
echo "- Metal Rusted: https://polyhaven.com/a/metal_rusty_001"
echo "- Asphalt: https://polyhaven.com/a/asphalt_001"

# Check if curl or wget is available
if command -v curl &> /dev/null; then
    echo ""
    echo "Would you like to download example assets? (This requires valid URLs)"
    echo "You can manually download from the sources above and place them in:"
    echo "  public/assets/textures/"
fi

