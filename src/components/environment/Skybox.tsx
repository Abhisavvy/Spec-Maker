import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Stars } from '@react-three/drei';
import { Mesh, BackSide } from 'three';

/**
 * Skybox component for atmospheric environment
 */
export function Skybox() {
    const skyRef = useRef<Mesh>(null);

    // Slowly rotate skybox for dynamic feel
    useFrame((state) => {
        if (skyRef.current) {
            skyRef.current.rotation.y = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <>
            {/* Stars background */}
            <Stars
                radius={300}
                depth={60}
                count={2000}
                factor={4}
                saturation={0.5}
                fade
                speed={0.5}
            />

            {/* Gradient sky sphere */}
            <Sphere ref={skyRef} args={[500, 32, 32]}>
                <meshBasicMaterial
                    side={BackSide}
                    color="#0a0a1a"
                />
            </Sphere>

            {/* Ambient fog effect */}
            <fog attach="fog" args={['#0a0a1a', 50, 300]} />
        </>
    );
}

