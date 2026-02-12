/**
 * Asset Configuration
 * 
 * I've set up the infrastructure for professional assets.
 * 
 * QUICK SETUP:
 * 1. Visit https://polyhaven.com/textures (free CC0 textures)
 * 2. Download texture sets (concrete, metal, etc.)
 * 3. Place in public/assets/textures/[category]/
 * 4. Uncomment and update paths below
 * 5. Restart dev server
 * 
 * See QUICK_ASSET_SETUP.md for detailed instructions
 */

export interface AssetConfig {
    // Platform textures (PBR maps)
    platform: {
        albedo?: string;      // Base color/diffuse texture
        normal?: string;      // Normal map
        roughness?: string;   // Roughness map
        metallic?: string;    // Metallic map
        ao?: string;          // Ambient occlusion
    };
    
    // Ground textures
    ground: {
        albedo?: string;
        normal?: string;
        roughness?: string;
        metallic?: string;
        ao?: string;
    };
    
    // Obstacle textures
    obstacle: {
        albedo?: string;
        normal?: string;
        roughness?: string;
        metallic?: string;
        ao?: string;
    };
    
    // 3D Models
    models: {
        platform?: string;    // GLTF/GLB model path
        collectible?: string; // GLTF/GLB model path
        checkpoint?: string;  // GLTF/GLB model path
        goal?: string;        // GLTF/GLB model path
        character?: string;   // GLTF/GLB model path (optional)
    };
    
    // Environment
    environment: {
        skybox?: string;      // HDR or cubemap texture
    };
}

// Asset configuration - Textures will auto-load if they exist in public/assets/textures/
// If textures don't exist, high-quality procedural textures will be used instead
export const ASSET_CONFIG: AssetConfig = {
    platform: {
        // Will try to load this texture, falls back to procedural if not found
        albedo: '/assets/textures/platform/albedo.jpg',
        // Uncomment these after downloading full PBR texture sets:
        // normal: '/assets/textures/platform/normal.jpg',
        // roughness: '/assets/textures/platform/roughness.jpg',
        // metallic: '/assets/textures/platform/metallic.jpg',
        // ao: '/assets/textures/platform/ao.jpg',
    },
    
    ground: {
        // Will try to load this texture, falls back to procedural if not found
        albedo: '/assets/textures/ground/albedo.jpg',
        // Uncomment these after downloading full PBR texture sets:
        // normal: '/assets/textures/ground/normal.jpg',
        // roughness: '/assets/textures/ground/roughness.jpg',
        // metallic: '/assets/textures/ground/metallic.jpg',
        // ao: '/assets/textures/ground/ao.jpg',
    },
    
    obstacle: {
        // Will try to load this texture, falls back to procedural if not found
        albedo: '/assets/textures/obstacle/albedo.jpg',
        // Uncomment these after downloading full PBR texture sets:
        // normal: '/assets/textures/obstacle/normal.jpg',
        // roughness: '/assets/textures/obstacle/roughness.jpg',
        // metallic: '/assets/textures/obstacle/metallic.jpg',
        // ao: '/assets/textures/obstacle/ao.jpg',
    },
    
    models: {
        // After downloading 3D models, uncomment and update:
        // platform: '/assets/models/platform.glb',
        // collectible: '/assets/models/coin.glb',
        // checkpoint: '/assets/models/checkpoint.glb',
        // goal: '/assets/models/goal.glb',
    },
    
    environment: {
        // After downloading skybox, uncomment and update:
        // skybox: '/assets/environment/skybox.hdr',
    },
};

// Asset loading utilities
export const ASSET_PATHS = {
    // Base paths
    TEXTURES: '/assets/textures/',
    MODELS: '/assets/models/',
    ENVIRONMENT: '/assets/environment/',
    
    // Common texture naming conventions
    ALBEDO_SUFFIX: '_albedo.jpg',
    NORMAL_SUFFIX: '_normal.jpg',
    ROUGHNESS_SUFFIX: '_roughness.jpg',
    METALLIC_SUFFIX: '_metallic.jpg',
    AO_SUFFIX: '_ao.jpg',
} as const;
