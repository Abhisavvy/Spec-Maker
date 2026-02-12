import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { ParticleSystem } from './ParticleSystem';

interface CollectibleEffectProps {
    position: Vector3;
    color: string;
    onComplete: () => void;
}

export function CollectibleEffect({ position, color, onComplete }: CollectibleEffectProps) {
    const lifetimeRef = useRef(0);

    useFrame((state, delta) => {
        lifetimeRef.current += delta;
        if (lifetimeRef.current > 1.0) {
            onComplete();
        }
    });

    return (
        <group position={[position.x, position.y, position.z]}>
            <ParticleSystem
                count={50}
                color={color}
                lifetime={1.0}
                speed={5}
                size={0.1}
            />
        </group>
    );
}

