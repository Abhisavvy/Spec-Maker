import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Box, RoundedBox } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';
import { AssetLoader } from '../../utils/assetLoader';
import type { Platform } from '../../types/level';

interface EnhancedPlatformProps {
    platform: Platform;
}

export function EnhancedPlatform({ platform }: EnhancedPlatformProps) {
    const pos = platform.position;
    
    // Create polished material
    const material = useMemo(() => AssetLoader.createPlatformMaterial(), []);
    
    // Edge glow material
    const glowMaterial = useMemo(() => {
        return new MeshStandardMaterial({
            color: '#00ff88',
            emissive: '#00ff88',
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.6,
        });
    }, []);

    // Subtle floating animation for moving platforms
    const offsetRef = useRef(0);
    useFrame((state) => {
        if (platform.type === 'moving' && platform.movePath) {
            offsetRef.current = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    return (
        <RigidBody
            type={platform.type === 'static' ? 'fixed' : 'kinematicPosition'}
            colliders="cuboid"
        >
            {/* Main platform */}
            <RoundedBox
                args={[platform.size.x, platform.size.y, platform.size.z]}
                position={[pos.x, pos.y + offsetRef.current, pos.z]}
                rotation={platform.rotation ? [platform.rotation.x, platform.rotation.y, platform.rotation.z] : [0, 0, 0]}
                radius={0.15}
                smoothness={4}
                castShadow
                receiveShadow
            >
                <primitive object={material} attach="material" />
            </RoundedBox>
            
            {/* Top edge glow */}
            <Box
                args={[platform.size.x + 0.1, 0.08, platform.size.z + 0.1]}
                position={[pos.x, pos.y + platform.size.y / 2 + 0.04 + offsetRef.current, pos.z]}
            >
                <primitive object={glowMaterial} attach="material" />
            </Box>

            {/* Bottom edge glow (subtle) */}
            <Box
                args={[platform.size.x + 0.05, 0.05, platform.size.z + 0.05]}
                position={[pos.x, pos.y - platform.size.y / 2 - 0.025 + offsetRef.current, pos.z]}
            >
                <meshStandardMaterial
                    color="#00ff88"
                    emissive="#00ff88"
                    emissiveIntensity={0.2}
                    transparent
                    opacity={0.3}
                />
            </Box>
        </RigidBody>
    );
}
