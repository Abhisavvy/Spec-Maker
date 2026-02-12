import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { Vector3 } from 'three';
import { Line } from '@react-three/drei';

interface SpeedLinesProps {
    threshold?: number;
    count?: number;
    length?: number;
}

export function SpeedLines({
    threshold = 10,
    count = 20,
    length = 5,
}: SpeedLinesProps) {
    const velocity = useGameStore((state) => state.velocity);
    const position = useGameStore((state) => state.position);
    const linesRef = useRef<any[]>([]);

    const speed = velocity.length();
    const enabled = speed > threshold;

    // Generate lines
    const lines = useMemo(() => {
        return Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const radius = 2;
            const start = new Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );
            const end = start.clone().multiplyScalar(1 + length);
            return { start, end };
        });
    }, [count, length]);

    if (!enabled) return null;

    const direction = velocity.length() > 0 
        ? velocity.clone().normalize().negate()
        : new Vector3(0, 0, -1);

    return (
        <group position={position}>
            {lines.map((line, i) => {
                // Simple speed lines pointing in opposite direction of movement
                const offset = direction.clone().multiplyScalar(i * 0.1);
                const start = line.start.clone().add(offset);
                const end = line.end.clone().add(offset);

                return (
                    <Line
                        key={i}
                        points={[start, end]}
                        color="#00ffff"
                        lineWidth={2}
                        transparent
                        opacity={Math.min(1, speed / threshold / 2)}
                    />
                );
            })}
        </group>
    );
}

