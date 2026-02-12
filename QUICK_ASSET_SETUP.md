# Quick Asset Setup Guide

I've set up the infrastructure for professional assets. Here's how to quickly add them:

## Option 1: Use Poly Haven (Recommended - Free CC0)

1. **Visit Poly Haven**: https://polyhaven.com/textures

2. **Download Concrete Texture** (for ground/platforms):
   - Go to: https://polyhaven.com/a/concrete_floor_001
   - Click "Download" → Choose "JPG" format
   - Extract the ZIP file
   - Rename files:
     - `concrete_floor_001_diffuse_1k.jpg` → `albedo.jpg`
     - `concrete_floor_001_normal_1k.jpg` → `normal.jpg`
     - `concrete_floor_001_roughness_1k.jpg` → `roughness.jpg`
     - `concrete_floor_001_metalness_1k.jpg` → `metallic.jpg`
     - `concrete_floor_001_ao_1k.jpg` → `ao.jpg`
   - Copy to: `public/assets/textures/ground/`

3. **Download Metal Texture** (for obstacles):
   - Go to: https://polyhaven.com/a/metal_rusty_001
   - Same process as above
   - Copy to: `public/assets/textures/obstacle/`

4. **Download Another Concrete** (for platforms):
   - Go to: https://polyhaven.com/a/concrete_wall_001
   - Same process
   - Copy to: `public/assets/textures/platform/`

5. **Update Configuration**:
   - Open `src/config/assets.ts`
   - Uncomment and update the paths:
   ```typescript
   ground: {
       albedo: '/assets/textures/ground/albedo.jpg',
       normal: '/assets/textures/ground/normal.jpg',
       roughness: '/assets/textures/ground/roughness.jpg',
       metallic: '/assets/textures/ground/metallic.jpg',
       ao: '/assets/textures/ground/ao.jpg',
   },
   ```

## Option 2: Use Kenney Assets (Free CC0)

1. **Visit**: https://kenney.nl/assets
2. **Download**: "Platformer Pack" or "Abstract Platformer"
3. **Extract** and place textures/models in appropriate folders
4. **Update** `src/config/assets.ts`

## Option 3: Use Quaternius Models (Free CC0)

1. **Visit**: https://quaternius.com/
2. **Download**: Low-poly game assets
3. **Export** to GLTF/GLB format if needed
4. **Place** in `public/assets/models/`
5. **Update** `src/config/assets.ts`:
   ```typescript
   models: {
       platform: '/assets/models/platform.glb',
   }
   ```

## After Adding Assets

1. Restart your dev server: `npm run dev`
2. The game will automatically use your professional assets!
3. If assets aren't loading, check browser console for errors

## Quick Test

To test if the system works:
1. Download ONE texture from Poly Haven
2. Place it in `public/assets/textures/ground/albedo.jpg`
3. Update `src/config/assets.ts`:
   ```typescript
   ground: {
       albedo: '/assets/textures/ground/albedo.jpg',
   }
   ```
4. Restart dev server
5. You should see the texture applied!

The system automatically falls back to procedural materials if assets aren't found, so your game will always work.

