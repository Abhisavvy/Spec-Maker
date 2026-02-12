import { create } from 'zustand';
import { Vector3 } from 'three';

interface GameStore {
    // Character state
    position: Vector3;
    velocity: Vector3;
    isGrounded: boolean;
    isDashing: boolean;
    isWallRunning: boolean;
    isSliding: boolean;
    speed: number;

    // Game state
    health: number;
    ammo: number;
    score: number;

    // Actions (transient - don't cause re-renders)
    setPosition: (pos: Vector3) => void;
    setVelocity: (vel: Vector3) => void;
    setGrounded: (grounded: boolean) => void;
    setDashing: (dashing: boolean) => void;
    setWallRunning: (wallRunning: boolean) => void;
    setSliding: (sliding: boolean) => void;
    setSpeed: (speed: number) => void;
    setHealth: (health: number) => void;
    setAmmo: (ammo: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
    // Initial state
    position: new Vector3(0, 5, 0),
    velocity: new Vector3(0, 0, 0),
    isGrounded: false,
    isDashing: false,
    isWallRunning: false,
    isSliding: false,
    speed: 0,

    health: 100,
    ammo: 100,
    score: 0,

    // Actions
    setPosition: (pos) => set({ position: pos }),
    setVelocity: (vel) => set({ velocity: vel }),
    setGrounded: (grounded) => set({ isGrounded: grounded }),
    setDashing: (dashing) => set({ isDashing: dashing }),
    setWallRunning: (wallRunning) => set({ isWallRunning: wallRunning }),
    setSliding: (sliding) => set({ isSliding: sliding }),
    setSpeed: (speed) => set({ speed }),
    setHealth: (health) => set({ health }),
    setAmmo: (ammo) => set({ ammo }),
}));
