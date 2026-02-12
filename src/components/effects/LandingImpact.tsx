import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { Vector3 } from 'three';
import { ParticleSystem } from './ParticleSystem';

interface LandingImpactProps {
    threshold?: number;
}

export function LandingImpact({ threshold = 5 }: LandingImpactProps) {
    const isGrounded = useGameStore((state) => state.isGrounded);
    const velocity = useGameStore((state) => state.velocity);
    const position = useGameStore((state) => state.position);
    const [showImpact, setShowImpact] = useState(false);
    const [impactPosition, setImpactPosition] = useState<[number, number, number]>([0, 0, 0]);
    const wasGroundedRef = useRef(false);
    const impactTimeoutRef = useRef<number | null>(null);

    useFrame(() => {
        const verticalSpeed = Math.abs(velocity.y);
        const justLanded = !wasGroundedRef.current && isGrounded;

        if (justLanded && verticalSpeed > threshold) {
            setImpactPosition([position.x, position.y, position.z]);
            setShowImpact(true);

            if (impactTimeoutRef.current) {
                clearTimeout(impactTimeoutRef.current);
            }
            impactTimeoutRef.current = setTimeout(() => {
                setShowImpact(false);
            }, 500);
        }

        wasGroundedRef.current = isGrounded;
    });

    if (!showImpact) return null;

    return (
        <ParticleSystem
            count={30}
            color="#ffffff"
            size={0.2}
            speed={3}
            life={0.5}
            position={impactPosition}
            enabled={showImpact}
        />
    );
}

