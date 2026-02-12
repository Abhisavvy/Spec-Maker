# Direct Download Links for Free Professional Assets

## Quick Download Guide

I've set up everything for you. Here are direct links to download free professional assets:

## Option 1: Poly Haven (Recommended - Free CC0)

### Concrete Floor Texture (for Ground)
1. Visit: https://polyhaven.com/a/concrete_floor_001
2. Click "Download" → Select "JPG" format
3. Extract ZIP file
4. Rename files:
   - `concrete_floor_001_diffuse_1k.jpg` → `albedo.jpg`
   - `concrete_floor_001_normal_1k.jpg` → `normal.jpg`
   - `concrete_floor_001_roughness_1k.jpg` → `roughness.jpg`
   - `concrete_floor_001_metalness_1k.jpg` → `metallic.jpg`
   - `concrete_floor_001_ao_1k.jpg` → `ao.jpg`
5. Copy all 5 files to: `public/assets/textures/ground/`

### Metal Rusty Texture (for Obstacles)
1. Visit: https://polyhaven.com/a/metal_rusty_001
2. Same process as above
3. Copy to: `public/assets/textures/obstacle/`

### Concrete Wall Texture (for Platforms)
1. Visit: https://polyhaven.com/a/concrete_wall_001
2. Same process as above
3. Copy to: `public/assets/textures/platform/`

## Option 2: Kenney Assets (Free CC0)

### Platformer Pack
1. Visit: https://kenney.nl/assets/abstract-platformer
2. Download the pack
3. Extract and use textures/models as needed

## After Downloading

1. **Update Configuration**: Open `src/config/assets.ts` and uncomment the paths:

```typescript
ground: {
    albedo: '/assets/textures/ground/albedo.jpg',
    normal: '/assets/textures/ground/normal.jpg',
    roughness: '/assets/textures/ground/roughness.jpg',
    metallic: '/assets/textures/ground/metallic.jpg',
    ao: '/assets/textures/ground/ao.jpg',
},
```

2. **Restart Dev Server**: `npm run dev`

3. **Verify**: Check browser console - assets should load automatically!

## Quick Test

To quickly test the system:
1. Download just ONE texture (albedo) from Poly Haven
2. Place it as `public/assets/textures/ground/albedo.jpg`
3. Update `src/config/assets.ts`:
   ```typescript
   ground: {
       albedo: '/assets/textures/ground/albedo.jpg',
   }
   ```
4. Restart dev server
5. You should see the texture applied!

The system automatically falls back to procedural materials if assets aren't found, so your game will always work even without assets.

