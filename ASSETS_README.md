# Professional Assets Setup Guide

This guide will help you integrate professional 3D models and textures into your game.

## Directory Structure

Create the following directory structure in your `public` folder:

```
public/
  assets/
    textures/
      platform/
        albedo.jpg
        normal.jpg
        roughness.jpg
        metallic.jpg
        ao.jpg
      ground/
        concrete_albedo.jpg
        concrete_normal.jpg
        concrete_roughness.jpg
        concrete_metallic.jpg
        concrete_ao.jpg
      obstacle/
        metal_albedo.jpg
        metal_normal.jpg
        metal_roughness.jpg
        metal_metallic.jpg
        ao.jpg
    models/
      platform.glb
      collectible.glb
      checkpoint.glb
      goal.glb
      character.glb (optional)
    environment/
      skybox.hdr
```

## Recommended Asset Sources

### Free Professional Assets

1. **Poly Haven** (https://polyhaven.com/)
   - High-quality CC0 textures and HDRIs
   - PBR textures with all maps included
   - Free for commercial use
   - Formats: JPG, PNG, EXR, HDR

2. **Quaternius** (https://quaternius.com/)
   - Free low-poly 3D models
   - Game-ready assets
   - GLTF/GLB format
   - CC0 license

3. **Kenney.nl** (https://kenney.nl/)
   - Free game assets
   - Textures and models
   - CC0 license

4. **OpenGameArt** (https://opengameart.org/)
   - Community-contributed assets
   - Various licenses (check per asset)
   - Textures, models, and more

5. **Sketchfab** (https://sketchfab.com/)
   - Filter by "Downloadable" and "Free"
   - High-quality models
   - Various formats including GLTF

### Paid Professional Assets

1. **GameTextures.com**
   - Professional PBR textures
   - Substance-powered materials
   - Subscription-based

2. **ArtStation Marketplace**
   - High-quality 3D models
   - Professional textures
   - Various price points

3. **Unity Asset Store** (can export to GLTF)
   - Professional game assets
   - Regular sales and free assets

## Texture Requirements

### PBR Texture Maps

For realistic materials, you'll need these texture maps:

1. **Albedo/Diffuse** - Base color (no lighting/shadow)
2. **Normal** - Surface detail and bumps
3. **Roughness** - How rough/smooth the surface is (grayscale)
4. **Metallic** - Metal vs non-metal areas (grayscale)
5. **AO (Ambient Occlusion)** - Shadow details (grayscale, optional)

### Texture Specifications

- **Format**: JPG (for color) or PNG (for transparency/normal maps)
- **Resolution**: 512x512, 1024x1024, or 2048x2048
- **Color Space**: sRGB for albedo, linear for others
- **Normal Maps**: Should be in tangent space

## Model Requirements

### 3D Model Specifications

- **Format**: GLTF (.gltf) or GLB (.glb) - GLB is preferred (single file)
- **Poly Count**: Optimized for real-time (under 10k triangles per object)
- **Textures**: Embedded or referenced
- **Scale**: 1 unit = 1 meter (recommended)

### Model Optimization Tips

1. Use Draco compression for smaller file sizes
2. Combine textures into texture atlases
3. Remove unnecessary geometry
4. Use LOD (Level of Detail) for complex models

## Setup Instructions

### Step 1: Download Assets

1. Choose assets from the recommended sources
2. Download PBR texture sets (albedo, normal, roughness, metallic, AO)
3. Download or export 3D models in GLTF/GLB format

### Step 2: Organize Assets

1. Create the directory structure shown above
2. Place textures in appropriate folders
3. Place models in the `models/` folder

### Step 3: Configure Assets

Edit `src/config/assets.ts` and update the paths:

```typescript
export const ASSET_CONFIG: AssetConfig = {
    platform: {
        albedo: '/assets/textures/platform/albedo.jpg',
        normal: '/assets/textures/platform/normal.jpg',
        roughness: '/assets/textures/platform/roughness.jpg',
        metallic: '/assets/textures/platform/metallic.jpg',
    },
    // ... etc
};
```

### Step 4: Test

1. Run `npm run dev`
2. Check browser console for any loading errors
3. Verify textures and models appear correctly

## Quick Start: Using Poly Haven

1. Go to https://polyhaven.com/textures
2. Browse textures (e.g., "Concrete", "Metal", "Plastic")
3. Click on a texture
4. Download the "JPG" version
5. Extract the ZIP file
6. You'll find:
   - `diffuse.jpg` (use as albedo)
   - `normal.jpg`
   - `roughness.jpg`
   - `metalness.jpg` (use as metallic)
   - `ao.jpg` (ambient occlusion)
7. Rename and place in appropriate folders
8. Update `assets.ts` with the paths

## Troubleshooting

### Textures not loading
- Check file paths are correct
- Ensure files are in `public/assets/` directory
- Check browser console for 404 errors
- Verify file names match exactly (case-sensitive)

### Models not appearing
- Verify GLTF/GLB format
- Check model scale (might be too small/large)
- Ensure model has materials assigned
- Check browser console for errors

### Performance issues
- Reduce texture resolution
- Use compressed textures (JPG instead of PNG where possible)
- Optimize model poly count
- Use texture atlases

## Example Asset Packages

### Recommended Free Packages

1. **Poly Haven Concrete Set**
   - Perfect for platforms and ground
   - Multiple variations available

2. **Quaternius Low Poly Pack**
   - Game-ready models
   - Optimized for performance

3. **Kenney Platformer Pack**
   - Complete game asset set
   - Includes platforms, collectibles, etc.

## Support

If you need help:
1. Check the browser console for errors
2. Verify file paths in `assets.ts`
3. Ensure assets are in the correct format
4. Test with a simple texture first before adding all assets

