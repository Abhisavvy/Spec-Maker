import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Box, RoundedBox } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';
import { AssetLoader } from '../../utils/assetLoader';
import { ASSET_CONFIG } from '../../config/assets';
import type { Platform } from '../../types/level';

interface AssetPlatformProps {
    platform: Platform;
}

/**
 * Platform component that uses professional 3D models or textures
 * Falls back to procedural if assets not configured
 */
export function AssetPlatform({ platform }: AssetPlatformProps) {
    const pos = platform.position;
    const [material, setMaterial] = useState<MeshStandardMaterial | null>(null);
    const [model, setModel] = useState<any>(null);
    const offsetRef = useRef(0);

    // Load professional assets
    useEffect(() => {
        // Set fallback material immediately so component renders
        setMaterial(AssetLoader.createPlatformMaterial());
        
        const loadAssets = async () => {
            // Try to load 3D model first
            if (ASSET_CONFIG.models.platform) {
                try {
                    const gltf = await AssetLoader.loadModel(ASSET_CONFIG.models.platform);
                    setModel(gltf);
                    return;
                } catch (error) {
                    console.warn('Failed to load platform model, using fallback:', error);
                }
            }

            // Try to load PBR textures
            if (ASSET_CONFIG.platform.albedo) {
                try {
                    const mat = await AssetLoader.loadPlatformMaterial();
                    setMaterial(mat);
                } catch (error) {
                    console.warn('Failed to load platform textures, using fallback:', error);
                    // Fallback already set above
                }
            }
        };

        loadAssets();
    }, []);

    // Subtle floating animation for moving platforms
    useFrame((state) => {
        if (platform.type === 'moving' && platform.movePath) {
            offsetRef.current = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    // If we have a 3D model, use it
    if (model && model.scene) {
        return (
            <RigidBody
                type={platform.type === 'static' ? 'fixed' : 'kinematicPosition'}
                colliders="cuboid"
            >
                <primitive
                    object={model.scene.clone()}
                    position={[pos.x, pos.y + offsetRef.current, pos.z]}
                    scale={[platform.size.x, platform.size.y, platform.size.z]}
                    rotation={platform.rotation ? [platform.rotation.x, platform.rotation.y, platform.rotation.z] : [0, 0, 0]}
                    castShadow
                    receiveShadow
                />
            </RigidBody>
        );
    }

    // Use geometry with professional textures (or fallback)
    const finalMaterial = material || AssetLoader.createPlatformMaterial();
    
    return (
        <RigidBody
            type={platform.type === 'static' ? 'fixed' : 'kinematicPosition'}
            colliders="cuboid"
        >
            <RoundedBox
                args={[platform.size.x, platform.size.y, platform.size.z]}
                position={[pos.x, pos.y + offsetRef.current, pos.z]}
                rotation={platform.rotation ? [platform.rotation.x, platform.rotation.y, platform.rotation.z] : [0, 0, 0]}
                radius={0.15}
                smoothness={4}
                castShadow
                receiveShadow
            >
                <primitive object={finalMaterial} attach="material" />
            </RoundedBox>
        </RigidBody>
    );
}
