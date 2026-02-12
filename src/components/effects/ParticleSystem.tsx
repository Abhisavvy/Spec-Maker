import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { BufferGeometry, Float32BufferAttribute, Color } from 'three';

interface Particle {
    position: [number, number, number];
    velocity: [number, number, number];
    life: number;
    maxLife: number;
}

interface ParticleSystemProps {
    count?: number;
    color?: string;
    size?: number;
    speed?: number;
    life?: number;
    position?: [number, number, number];
    enabled?: boolean;
}

export function ParticleSystem({
    count = 100,
    color = '#ffffff',
    size = 0.1,
    speed = 1,
    life = 1,
    position = [0, 0, 0],
    enabled = true,
}: ParticleSystemProps) {
    const particlesRef = useRef<Points>(null);
    const particles = useRef<Particle[]>([]);

    // Initialize particles
    useMemo(() => {
        particles.current = Array.from({ length: count }, () => ({
            position: [
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
            ] as [number, number, number],
            velocity: [
                (Math.random() - 0.5) * speed,
                (Math.random() - 0.5) * speed,
                (Math.random() - 0.5) * speed,
            ] as [number, number, number],
            life: Math.random() * life,
            maxLife: life,
        }));
    }, [count, speed, life]);

    useFrame((state, delta) => {
        if (!particlesRef.current || !enabled) return;

        const positions: number[] = [];
        const colors: number[] = [];
        const particleColor = new Color(color);

        particles.current.forEach((particle) => {
            // Update particle
            particle.life -= delta;
            if (particle.life <= 0) {
                // Reset particle
                particle.life = particle.maxLife;
                particle.position = [
                    (Math.random() - 0.5) * 2 + position[0],
                    (Math.random() - 0.5) * 2 + position[1],
                    (Math.random() - 0.5) * 2 + position[2],
                ] as [number, number, number];
                particle.velocity = [
                    (Math.random() - 0.5) * speed,
                    (Math.random() - 0.5) * speed,
                    (Math.random() - 0.5) * speed,
                ] as [number, number, number];
            } else {
                // Update position
                particle.position[0] += particle.velocity[0] * delta;
                particle.position[1] += particle.velocity[1] * delta;
                particle.position[2] += particle.velocity[2] * delta;
            }

            // Add to arrays
            positions.push(
                particle.position[0],
                particle.position[1],
                particle.position[2]
            );
            const alpha = particle.life / particle.maxLife;
            colors.push(
                particleColor.r,
                particleColor.g,
                particleColor.b,
                alpha
            );
        });

        // Update geometry
        const geometry = particlesRef.current.geometry;
        geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new Float32BufferAttribute(colors, 4));
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
    });

    if (!enabled) return null;

    return (
        <Points ref={particlesRef} position={position}>
            <PointMaterial
                size={size}
                vertexColors
                transparent
                opacity={0.8}
                depthWrite={false}
            />
        </Points>
    );
}

