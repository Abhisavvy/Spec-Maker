#!/bin/bash

# Download textures from alternative free sources with simpler APIs
# These sources allow direct downloads without complex authentication

set -e

BASE_DIR="public/assets/textures"
mkdir -p "$BASE_DIR/ground" "$BASE_DIR/platform" "$BASE_DIR/obstacle"

echo "📥 Downloading textures from alternative free sources..."

# Method 1: Unsplash Source API (free, no auth required for reasonable use)
# Concrete/stone textures
echo "Trying Unsplash Source API..."
curl -L "https://source.unsplash.com/1024x1024/?concrete,stone" \
  -o "$BASE_DIR/ground/albedo.jpg" \
  --fail --silent --show-error --max-time 10 || echo "⚠️  Unsplash failed"

# Metal textures
curl -L "https://source.unsplash.com/1024x1024/?metal,steel" \
  -o "$BASE_DIR/platform/albedo.jpg" \
  --fail --silent --show-error --max-time 10 || echo "⚠️  Unsplash failed"

# Method 2: Picsum Photos (Lorem Picsum) - Random high-quality images
echo "Trying Picsum Photos..."
curl -L "https://picsum.photos/1024/1024?random=1" \
  -o "$BASE_DIR/ground/albedo.jpg" \
  --fail --silent --show-error --max-time 10 || echo "⚠️  Picsum failed"

curl -L "https://picsum.photos/1024/1024?random=2" \
  -o "$BASE_DIR/platform/albedo.jpg" \
  --fail --silent --show-error --max-time 10 || echo "⚠️  Picsum failed"

# Method 3: Placeholder.com with texture-like patterns
echo "Trying Placeholder.com..."
curl -L "https://via.placeholder.com/1024x1024/5a5a5a/ffffff?text=Concrete" \
  -o "$BASE_DIR/ground/albedo.jpg" \
  --fail --silent --show-error || echo "⚠️  Placeholder failed"

curl -L "https://via.placeholder.com/1024x1024/4a4a4a/ffffff?text=Metal" \
  -o "$BASE_DIR/platform/albedo.jpg" \
  --fail --silent --show-error || echo "⚠️  Placeholder failed"

# Method 4: Use ImageMagick to create textures if available
if command -v convert &> /dev/null; then
    echo "Creating textures with ImageMagick..."
    
    # Concrete texture with noise
    convert -size 1024x1024 xc:#5a5a5a \
        -noise Random -blur 0x1 \
        -normalize \
        "$BASE_DIR/ground/albedo.jpg" 2>/dev/null || true
    
    # Metal texture with gradient
    convert -size 1024x1024 gradient:#6a6a6a-#3a3a3a \
        -noise Random -blur 0x0.5 \
        "$BASE_DIR/platform/albedo.jpg" 2>/dev/null || true
    
    # Obstacle texture (metallic)
    convert -size 1024x1024 gradient:#4a4a4a-#2a2a2a \
        -noise Random \
        "$BASE_DIR/obstacle/albedo.jpg" 2>/dev/null || true
fi

# Verify what we got
echo ""
echo "✅ Download attempt complete!"
echo "📁 Checking downloaded files..."
ls -lh "$BASE_DIR"/*/*.jpg 2>/dev/null | head -5 || echo "⚠️  No textures downloaded, using procedural fallback"

