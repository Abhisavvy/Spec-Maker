import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { Vector3 } from 'three';
import { Line } from '@react-three/drei';

interface TrailPoint {
    position: Vector3;
    time: number;
}

interface DashTrailProps {
    duration?: number;
    maxPoints?: number;
    color?: string;
}

export function DashTrail({
    duration = 0.5,
    maxPoints = 20,
    color = '#00ff88',
}: DashTrailProps) {
    const isDashing = useGameStore((state) => state.isDashing);
    const position = useGameStore((state) => state.position);
    const trailRef = useRef<TrailPoint[]>([]);

    // Add point when dashing
    useEffect(() => {
        if (isDashing) {
            const point: TrailPoint = {
                position: position.clone(),
                time: Date.now(),
            };
            trailRef.current.push(point);

            // Limit trail length
            if (trailRef.current.length > maxPoints) {
                trailRef.current.shift();
            }
        }
    }, [isDashing, position, maxPoints]);

    // Update and remove old points
    useFrame(() => {
        const now = Date.now();
        trailRef.current = trailRef.current.filter(
            (point) => now - point.time < duration * 1000
        );
    });

    if (trailRef.current.length < 2) return null;

    const points = trailRef.current.map((p) => p.position);

    return (
        <Line
            points={points}
            color={color}
            lineWidth={3}
            transparent
            opacity={0.6}
        />
    );
}

