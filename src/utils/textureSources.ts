/**
 * Alternative Texture Sources
 * 
 * This module provides access to free texture sources with simpler download mechanisms
 * than Poly Haven. These can be used as alternatives or fallbacks.
 */

export interface TextureSource {
    name: string;
    url: string;
    description: string;
    license: string;
    requiresAuth: boolean;
}

/**
 * Free texture sources with simple download mechanisms
 */
export const TEXTURE_SOURCES: TextureSource[] = [
    {
        name: 'Unsplash Source',
        url: 'https://source.unsplash.com',
        description: 'High-quality photos, free for commercial use',
        license: 'Unsplash License (free for commercial use)',
        requiresAuth: false,
    },
    {
        name: 'Picsum Photos',
        url: 'https://picsum.photos',
        description: 'Random high-quality placeholder images',
        license: 'CC0 / Public Domain',
        requiresAuth: false,
    },
    {
        name: 'Placeholder.com',
        url: 'https://via.placeholder.com',
        description: 'Simple placeholder images with customizable patterns',
        license: 'Free to use',
        requiresAuth: false,
    },
    {
        name: 'OpenGameArt',
        url: 'https://opengameart.org',
        description: 'Free game assets including textures',
        license: 'Various (mostly CC0/CC-BY)',
        requiresAuth: false,
    },
];

/**
 * Generate a texture URL from Unsplash Source
 */
export function getUnsplashTextureUrl(
    width: number = 1024,
    height: number = 1024,
    keywords: string[] = ['concrete', 'stone']
): string {
    const query = keywords.join(',');
    return `https://source.unsplash.com/${width}x${height}/?${query}`;
}

/**
 * Generate a texture URL from Picsum Photos
 */
export function getPicsumTextureUrl(
    width: number = 1024,
    height: number = 1024,
    seed?: number
): string {
    if (seed !== undefined) {
        return `https://picsum.photos/seed/${seed}/${width}/${height}`;
    }
    return `https://picsum.photos/${width}/${height}`;
}

/**
 * Generate a texture URL from Placeholder.com
 */
export function getPlaceholderTextureUrl(
    width: number = 1024,
    height: number = 1024,
    bgColor: string = '5a5a5a',
    textColor: string = 'ffffff',
    text: string = ''
): string {
    return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
}

/**
 * Pre-configured texture URLs for common game materials
 */
export const GAME_TEXTURE_URLS = {
    concrete: {
        unsplash: getUnsplashTextureUrl(1024, 1024, ['concrete', 'stone', 'wall']),
        picsum: getPicsumTextureUrl(1024, 1024, 1001),
        placeholder: getPlaceholderTextureUrl(1024, 1024, '5a5a5a', 'ffffff', 'Concrete'),
    },
    metal: {
        unsplash: getUnsplashTextureUrl(1024, 1024, ['metal', 'steel', 'industrial']),
        picsum: getPicsumTextureUrl(1024, 1024, 1002),
        placeholder: getPlaceholderTextureUrl(1024, 1024, '4a4a4a', 'ffffff', 'Metal'),
    },
    ground: {
        unsplash: getUnsplashTextureUrl(1024, 1024, ['ground', 'floor', 'pavement']),
        picsum: getPicsumTextureUrl(1024, 1024, 1003),
        placeholder: getPlaceholderTextureUrl(1024, 1024, '4a4a4a', 'ffffff', 'Ground'),
    },
};

/**
 * Try to load a texture from alternative sources
 * Falls back through multiple sources until one works
 */
export async function loadTextureFromAlternatives(
    materialType: 'concrete' | 'metal' | 'ground'
): Promise<string | null> {
    const urls = GAME_TEXTURE_URLS[materialType];
    
    // Try each source in order
    const sources = [
        { name: 'unsplash', url: urls.unsplash },
        { name: 'picsum', url: urls.picsum },
        { name: 'placeholder', url: urls.placeholder },
    ];
    
    for (const source of sources) {
        try {
            const response = await fetch(source.url, { method: 'HEAD' });
            if (response.ok) {
                console.log(`✅ ${source.name} texture available for ${materialType}`);
                return source.url;
            }
        } catch (error) {
            console.warn(`⚠️  ${source.name} failed for ${materialType}:`, error);
            continue;
        }
    }
    
    return null;
}

