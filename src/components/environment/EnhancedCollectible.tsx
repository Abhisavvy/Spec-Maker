import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Sphere, Torus } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';
import type { Collectible } from '../../types/level';

interface EnhancedCollectibleProps {
    collectible: Collectible;
    collected: boolean;
}

export function EnhancedCollectible({ collectible, collected }: EnhancedCollectibleProps) {
    const rotationRef = useRef(0);
    const floatRef = useRef(0);
    const scaleRef = useRef(1);
    const pos = collectible.position;

    useFrame((state, delta) => {
        rotationRef.current += delta * 2;
        floatRef.current += delta;
        scaleRef.current = 1 + Math.sin(floatRef.current * 2) * 0.1;
    });

    if (collected) return null;

    const color = collectible.type === 'coin' ? '#ffd700' : '#00ff00';
    const emissiveColor = collectible.type === 'coin' ? '#ffaa00' : '#00ff88';

    return (
        <group position={[pos.x, pos.y + Math.sin(floatRef.current) * 0.3, pos.z]} scale={scaleRef.current}>
                {/* Main sphere */}
                <Sphere args={[0.3, 16, 16]}>
                    <meshStandardMaterial
                        color={color}
                        emissive={emissiveColor}
                        emissiveIntensity={1.0}
                        metalness={0.8}
                        roughness={0.2}
                    />
                </Sphere>
                
                {/* Rotating ring */}
                <Torus
                    args={[0.4, 0.05, 16, 32]}
                    rotation={[Math.PI / 2, rotationRef.current, 0]}
                >
                    <meshStandardMaterial
                        color={emissiveColor}
                        emissive={emissiveColor}
                        emissiveIntensity={1.5}
                    />
                </Torus>
                
                {/* Glow effect */}
                <Sphere args={[0.5, 16, 16]}>
                    <meshStandardMaterial
                        color={emissiveColor}
                        emissive={emissiveColor}
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.3}
                    />
                </Sphere>
        </group>
    );
}

