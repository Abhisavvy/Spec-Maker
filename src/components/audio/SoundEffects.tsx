import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAudioManager, SOUNDS } from '../../systems/AudioManager';

/**
 * Component that plays sound effects based on game state
 */
export function SoundEffects() {
    const isGrounded = useGameStore((state) => state.isGrounded);
    const isDashing = useGameStore((state) => state.isDashing);
    const isWallRunning = useGameStore((state) => state.isWallRunning);
    const isSliding = useGameStore((state) => state.isSliding);
    const velocity = useGameStore((state) => state.velocity);
    const { playSound } = useAudioManager();

    const wasGroundedRef = useRef(isGrounded);
    const wasDashingRef = useRef(isDashing);
    const wasWallRunningRef = useRef(isWallRunning);
    const wasSlidingRef = useRef(isSliding);

    // Play landing sound
    useEffect(() => {
        if (!wasGroundedRef.current && isGrounded) {
            const verticalSpeed = Math.abs(velocity.y);
            if (verticalSpeed > 3) {
                // playSound(SOUNDS.LAND, Math.min(1, verticalSpeed / 10));
                // Placeholder - actual sound would be played here
            }
        }
        wasGroundedRef.current = isGrounded;
    }, [isGrounded, velocity, playSound]);

    // Play dash sound
    useEffect(() => {
        if (!wasDashingRef.current && isDashing) {
            // playSound(SOUNDS.DASH);
            // Placeholder - actual sound would be played here
        }
        wasDashingRef.current = isDashing;
    }, [isDashing, playSound]);

    // Play wall-run sound
    useEffect(() => {
        if (!wasWallRunningRef.current && isWallRunning) {
            // playSound(SOUNDS.WALL_RUN, 0.7);
            // Placeholder - actual sound would be played here
        }
        wasWallRunningRef.current = isWallRunning;
    }, [isWallRunning, playSound]);

    // Play slide sound
    useEffect(() => {
        if (!wasSlidingRef.current && isSliding) {
            // playSound(SOUNDS.SLIDE, 0.6);
            // Placeholder - actual sound would be played here
        }
        wasSlidingRef.current = isSliding;
    }, [isSliding, playSound]);

    return null;
}

