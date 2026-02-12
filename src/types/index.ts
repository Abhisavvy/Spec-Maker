import { Vector3 } from 'three';

export interface CharacterState {
    position: Vector3;
    velocity: Vector3;
    isGrounded: boolean;
    isDashing: boolean;
    currentSurfaceNormal: Vector3 | null;
    health: number;
    ammo: number;
}

export interface SurfaceData {
    normal: Vector3;
    distance: number;
    point: Vector3;
}

export interface MovementInput {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
    dash: boolean;
}

export interface PhysicsConfig {
    magneticStrength: number;
    movementSpeed: number;
    jumpForce: number;
    dashForce: number;
}

export type GameMode = 'magnetic' | 'zero-g';
