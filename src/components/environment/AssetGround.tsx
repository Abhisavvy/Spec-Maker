import { useEffect, useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Box } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';
import { AssetLoader } from '../../utils/assetLoader';
import { ASSET_CONFIG } from '../../config/assets';

interface AssetGroundProps {
    size?: number;
    position?: [number, number, number];
}

/**
 * Ground component that uses professional textures
 * Falls back to procedural if assets not configured
 */
export function AssetGround({ size = 50, position = [0, -0.25, 0] }: AssetGroundProps) {
    const [material, setMaterial] = useState<MeshStandardMaterial | null>(null);

    useEffect(() => {
        // Always set a material immediately (fallback), then try to upgrade to professional
        setMaterial(AssetLoader.createGroundMaterial());
        
        const loadMaterial = async () => {
            if (ASSET_CONFIG.ground.albedo) {
                try {
                    const mat = await AssetLoader.loadGroundMaterial();
                    setMaterial(mat);
                } catch (error) {
                    console.warn('Failed to load ground textures, using fallback:', error);
                    // Fallback already set above
                }
            }
        };

        loadMaterial();
    }, []);

    // Always render with material (fallback if not loaded yet)
    const finalMaterial = material || AssetLoader.createGroundMaterial();

    return (
        <RigidBody type="fixed" colliders="cuboid">
            <Box 
                args={[size, 0.5, size]} 
                position={position}
                receiveShadow
            >
                <primitive object={finalMaterial} attach="material" />
            </Box>
        </RigidBody>
    );
}
