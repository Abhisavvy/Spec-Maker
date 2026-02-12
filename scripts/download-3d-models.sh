#!/bin/bash

# Download free 3D models from various sources
# These are CC0/public domain models suitable for games

set -e

BASE_DIR="public/assets/models"
mkdir -p "$BASE_DIR"

echo "📥 Downloading free 3D models..."

# Method 1: Try downloading from GitHub repositories with free models
echo "Trying GitHub repositories..."

# Simple platform/box model (we'll create a basic one if download fails)
curl -L "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Duck/glTF-Binary/Duck.glb" \
  -o "$BASE_DIR/duck.glb" \
  --fail --silent --show-error --max-time 15 || echo "⚠️  Duck model download failed"

# Method 2: Create simple placeholder models using a script
# (We'll use procedural geometry in the game instead)

echo ""
echo "✅ Model download attempt complete!"
echo "📁 Models directory: $BASE_DIR"
ls -lh "$BASE_DIR"/*.glb 2>/dev/null || echo "⚠️  No models downloaded, using procedural geometry"

