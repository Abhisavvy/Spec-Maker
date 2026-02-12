import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { Vector3 } from 'three';

interface ScreenShakeProps {
    intensity?: number;
    duration?: number;
}

export function ScreenShake({ intensity = 0.1, duration = 200 }: ScreenShakeProps) {
    const { camera } = useThree();
    const isDashing = useGameStore((state) => state.isDashing);
    const velocity = useGameStore((state) => state.velocity);
    const isGrounded = useGameStore((state) => state.isGrounded);
    const originalPositionRef = useRef<Vector3>(new Vector3());
    const shakeTimeoutRef = useRef<number | null>(null);
    const shakeStartTimeRef = useRef<number>(0);

    useEffect(() => {
        originalPositionRef.current.copy(camera.position);
    }, [camera]);

    useEffect(() => {
        let shouldShake = false;

        // Shake on dash
        if (isDashing) {
            shouldShake = true;
        }

        // Shake on hard landing
        const verticalSpeed = Math.abs(velocity.y);
        if (isGrounded && verticalSpeed > 8) {
            shouldShake = true;
        }

        if (shouldShake) {
            shakeStartTimeRef.current = Date.now();
            
            if (shakeTimeoutRef.current) {
                clearTimeout(shakeTimeoutRef.current);
            }
            shakeTimeoutRef.current = setTimeout(() => {
                camera.position.copy(originalPositionRef.current);
            }, duration);
        }
    }, [isDashing, velocity, isGrounded, camera, duration]);

    useFrame(() => {
        const elapsed = Date.now() - shakeStartTimeRef.current;
        if (elapsed < duration) {
            const shakeAmount = intensity * (1 - elapsed / duration);
            camera.position.x += (Math.random() - 0.5) * shakeAmount;
            camera.position.y += (Math.random() - 0.5) * shakeAmount;
            camera.position.z += (Math.random() - 0.5) * shakeAmount;
        }
    });

    return null;
}

