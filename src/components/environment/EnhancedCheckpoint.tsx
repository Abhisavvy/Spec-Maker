import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Box, Cylinder } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';
import type { Checkpoint } from '../../types/level';

interface EnhancedCheckpointProps {
    checkpoint: Checkpoint;
    reached: boolean;
}

export function EnhancedCheckpoint({ checkpoint, reached }: EnhancedCheckpointProps) {
    const rotationRef = useRef(0);
    const pulseRef = useRef(0);
    const pos = checkpoint.position;

    useFrame((state, delta) => {
        rotationRef.current += delta * 1.5;
        pulseRef.current += delta * 2;
    });

    const color = reached ? '#00ff00' : '#888888';
    const emissiveColor = reached ? '#00ff00' : '#444444';
    const intensity = reached ? 1.0 + Math.sin(pulseRef.current) * 0.3 : 0.3;

    return (
        <group position={[pos.x, pos.y, pos.z]}>
                {/* Main pillar */}
                <Cylinder args={[0.3, 0.3, 2, 16]} position={[0, 1, 0]}>
                    <meshStandardMaterial
                        color={color}
                        emissive={emissiveColor}
                        emissiveIntensity={intensity}
                        metalness={0.5}
                        roughness={0.3}
                    />
                </Cylinder>
                
                {/* Top platform */}
                <Box args={[0.8, 0.1, 0.8]} position={[0, 2, 0]}>
                    <meshStandardMaterial
                        color={color}
                        emissive={emissiveColor}
                        emissiveIntensity={intensity}
                    />
                </Box>
                
                {/* Rotating ring */}
                <Cylinder
                    args={[0.5, 0.5, 0.1, 32]}
                    position={[0, 1.5, 0]}
                    rotation={[0, rotationRef.current, 0]}
                >
                    <meshStandardMaterial
                        color={emissiveColor}
                        emissive={emissiveColor}
                        emissiveIntensity={intensity * 1.5}
                        transparent
                        opacity={0.8}
                    />
                </Cylinder>
                
                {/* Base glow */}
                <Cylinder args={[0.4, 0.4, 0.1, 32]} position={[0, 0.05, 0]}>
                    <meshStandardMaterial
                        color={emissiveColor}
                        emissive={emissiveColor}
                        emissiveIntensity={intensity * 0.5}
                        transparent
                        opacity={0.5}
                    />
                </Cylinder>
        </group>
    );
}

