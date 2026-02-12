import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextureLoader, RepeatWrapping, MeshStandardMaterial, CanvasTexture } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ASSET_CONFIG } from '../config/assets';

// Asset loader utility for loading 3D models and textures
export class AssetLoader {
    private static gltfLoader: GLTFLoader | null = null;
    private static textureLoader: TextureLoader | null = null;
    private static dracoLoader: DRACOLoader | null = null;
    // Cache for loaded assets
    private static textureCache: Map<string, any> = new Map();
    private static modelCache: Map<string, any> = new Map();

    static getGLTFLoader(): GLTFLoader {
        if (!this.gltfLoader) {
            this.gltfLoader = new GLTFLoader();
            // Setup Draco loader for compressed models
            if (!this.dracoLoader) {
                this.dracoLoader = new DRACOLoader();
                this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
                this.gltfLoader.setDRACOLoader(this.dracoLoader);
            }
        }
        return this.gltfLoader;
    }

    static getTextureLoader(): TextureLoader {
        if (!this.textureLoader) {
            this.textureLoader = new TextureLoader();
        }
        return this.textureLoader;
    }

    static async loadModel(url: string): Promise<any> {
        if (this.modelCache.has(url)) {
            return this.modelCache.get(url);
        }

        return new Promise((resolve, reject) => {
            this.getGLTFLoader().load(
                url,
                (gltf) => {
                    this.modelCache.set(url, gltf);
                    resolve(gltf);
                },
                undefined,
                (error) => reject(error)
            );
        });
    }

    static async loadTexture(url: string): Promise<any> {
        if (this.textureCache.has(url)) {
            return this.textureCache.get(url);
        }

        return new Promise((resolve, reject) => {
            // Add timeout to prevent hanging
            const timeout = setTimeout(() => {
                reject(new Error(`Texture load timeout: ${url}`));
            }, 10000); // 10 second timeout

            this.getTextureLoader().load(
                url,
                (texture) => {
                    clearTimeout(timeout);
                    texture.wrapS = RepeatWrapping;
                    texture.wrapT = RepeatWrapping;
                    this.textureCache.set(url, texture);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    clearTimeout(timeout);
                    console.warn(`Failed to load texture: ${url}`, error);
                    reject(error);
                }
            );
        });
    }


    /**
     * Load PBR material from texture maps
     */
    static async loadPBRMaterial(config: {
        albedo?: string;
        normal?: string;
        roughness?: string;
        metallic?: string;
        ao?: string;
        scale?: number;
    }): Promise<MeshStandardMaterial> {
        const promises: Promise<any>[] = [];
        const textureKeys: string[] = [];

        if (config.albedo) {
            promises.push(this.loadTexture(config.albedo));
            textureKeys.push('albedo');
        }
        if (config.normal) {
            promises.push(this.loadTexture(config.normal));
            textureKeys.push('normal');
        }
        if (config.roughness) {
            promises.push(this.loadTexture(config.roughness));
            textureKeys.push('roughness');
        }
        if (config.metallic) {
            promises.push(this.loadTexture(config.metallic));
            textureKeys.push('metallic');
        }
        if (config.ao) {
            promises.push(this.loadTexture(config.ao));
            textureKeys.push('ao');
        }

        // Load textures with error handling - continue even if some fail
        const textureResults = await Promise.allSettled(promises);
        const textureMap: any = {};
        textureKeys.forEach((key, index) => {
            const result = textureResults[index];
            if (result.status === 'fulfilled') {
                textureMap[key] = result.value;
            } else {
                console.warn(`Failed to load texture map: ${key}`, result.reason);
            }
        });

        // Set texture repeat
        const scale = config.scale || 1;
        Object.values(textureMap).forEach((texture: any) => {
            if (texture) {
                texture.repeat.set(scale, scale);
            }
        });

        const material = new MeshStandardMaterial({
            map: textureMap.albedo,
            normalMap: textureMap.normal,
            roughnessMap: textureMap.roughness,
            metalnessMap: textureMap.metallic,
            aoMap: textureMap.ao,
            aoMapIntensity: textureMap.ao ? 1.0 : 0,
        });

        return material;
    }

        /**
         * Load platform material from config
         * Tries to load texture, falls back to procedural if it fails
         */
        static async loadPlatformMaterial(): Promise<MeshStandardMaterial> {
            if (ASSET_CONFIG.platform.albedo) {
                try {
                    // Try to load the texture (will fail gracefully if file doesn't exist)
                    const texture = await this.loadTexture(ASSET_CONFIG.platform.albedo);
                    // If successful, create material with texture
                    texture.wrapS = RepeatWrapping;
                    texture.wrapT = RepeatWrapping;
                    texture.repeat.set(2, 2);
                    return new MeshStandardMaterial({
                        map: texture,
                        color: '#5a5a5a',
                        roughness: 0.75,
                        metalness: 0.15,
                    });
                } catch (error) {
                    // Texture doesn't exist or failed to load, use procedural
                    console.log('Using procedural platform material (texture not found or failed to load)');
                    return this.createPlatformMaterial();
                }
            }
            // Fallback to procedural
            return this.createPlatformMaterial();
        }

        /**
         * Load ground material from config
         * Tries to load texture, falls back to procedural if it fails
         */
        static async loadGroundMaterial(): Promise<MeshStandardMaterial> {
            if (ASSET_CONFIG.ground.albedo) {
                try {
                    // Try to load the texture (will fail gracefully if file doesn't exist)
                    const texture = await this.loadTexture(ASSET_CONFIG.ground.albedo);
                    // If successful, create material with texture
                    texture.wrapS = RepeatWrapping;
                    texture.wrapT = RepeatWrapping;
                    texture.repeat.set(4, 4);
                    return new MeshStandardMaterial({
                        map: texture,
                        color: '#4a4a4a',
                        roughness: 0.85,
                        metalness: 0.1,
                    });
                } catch (error) {
                    // Texture doesn't exist or failed to load, use procedural
                    console.log('Using procedural ground material (texture not found or failed to load)');
                    return this.createGroundMaterial();
                }
            }
            // Fallback to procedural
            return this.createGroundMaterial();
        }

        /**
         * Load obstacle material from config
         * Tries to load texture, falls back to procedural if it fails
         */
        static async loadObstacleMaterial(): Promise<MeshStandardMaterial> {
            if (ASSET_CONFIG.obstacle.albedo) {
                try {
                    // Try to load the texture (will fail gracefully if file doesn't exist)
                    await this.loadTexture(ASSET_CONFIG.obstacle.albedo);
                    // If successful, load full PBR material
                    return this.loadPBRMaterial({
                        ...ASSET_CONFIG.obstacle,
                        scale: 1,
                    });
                } catch (error) {
                    // Texture doesn't exist or failed to load, use procedural
                    return this.createMetallicMaterial();
                }
            }
            // Fallback to procedural
            return this.createMetallicMaterial();
        }

    // Fallback procedural materials - high quality professional-looking textures
    static createPlatformMaterial(): MeshStandardMaterial {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;
        
        // Professional concrete texture
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add realistic noise
        const imageData = ctx.createImageData(1024, 1024);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 40;
            const base = 90;
            const value = Math.max(0, Math.min(255, base + noise));
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        
        // Add texture details
        ctx.strokeStyle = 'rgba(40, 40, 40, 0.3)';
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 1024, Math.random() * 1024);
            ctx.lineTo(Math.random() * 1024, Math.random() * 1024);
            ctx.stroke();
        }
        
        const texture = new CanvasTexture(canvas);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(2, 2);
        
        return new MeshStandardMaterial({
            map: texture,
            color: '#5a5a5a',
            roughness: 0.75,
            metalness: 0.15,
        });
    }

    static createGroundMaterial(): MeshStandardMaterial {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;
        
        // Professional ground texture
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add realistic variation
        const imageData = ctx.createImageData(1024, 1024);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 50;
            const base = 74;
            const value = Math.max(0, Math.min(255, base + noise));
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        
        // Add aggregate texture
        ctx.fillStyle = 'rgba(60, 60, 60, 0.4)';
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const radius = Math.random() * 4 + 1;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new CanvasTexture(canvas);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(4, 4);
        
        return new MeshStandardMaterial({
            map: texture,
            color: '#4a4a4a',
            roughness: 0.85,
            metalness: 0.1,
        });
    }

    static createMetallicMaterial(): MeshStandardMaterial {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;
        
        // Professional metal texture
        const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
        gradient.addColorStop(0, '#6a6a6a');
        gradient.addColorStop(0.5, '#3a3a3a');
        gradient.addColorStop(1, '#6a6a6a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Brushed metal effect
        for (let i = 0; i < 1024; i += 2) {
            const alpha = 0.1 + Math.random() * 0.2;
            ctx.strokeStyle = `rgba(120, 120, 120, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(1024, i);
            ctx.stroke();
        }
        
        // Rust spots
        ctx.fillStyle = 'rgba(100, 50, 30, 0.3)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const radius = Math.random() * 10 + 5;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new CanvasTexture(canvas);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(1, 1);
        
        return new MeshStandardMaterial({
            map: texture,
            color: '#4a4a4a',
            roughness: 0.4,
            metalness: 0.7,
            emissive: '#ff4444',
            emissiveIntensity: 0.2,
        });
    }
}
