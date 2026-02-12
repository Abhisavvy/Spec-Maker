import { Vector3 } from 'three';

export interface Checkpoint {
    id: string;
    position: Vector3;
    rotation?: Vector3;
}

export interface Collectible {
    id: string;
    position: Vector3;
    type: 'coin' | 'powerup' | 'key';
    collected?: boolean;
}

export interface Platform {
    id: string;
    position: Vector3;
    size: Vector3;
    rotation?: Vector3;
    type: 'static' | 'moving' | 'rotating';
    movePath?: Vector3[];
    moveSpeed?: number;
    rotateSpeed?: Vector3;
}

export interface Obstacle {
    id: string;
    position: Vector3;
    size: Vector3;
    rotation?: Vector3;
    type: 'static' | 'moving' | 'rotating';
    movePath?: Vector3[];
    moveSpeed?: number;
    rotateSpeed?: Vector3;
}

export interface Goal {
    id: string;
    position: Vector3;
    size: Vector3;
    rotation?: Vector3;
}

export interface LevelData {
    id: string;
    name: string;
    description?: string;
    startPosition: Vector3;
    checkpoints: Checkpoint[];
    collectibles: Collectible[];
    platforms: Platform[];
    obstacles: Obstacle[];
    goal: Goal;
    timeLimit?: number; // in seconds
    requiredCollectibles?: number;
}

export interface LevelProgress {
    levelId: string;
    completed: boolean;
    bestTime?: number;
    collectiblesFound: string[];
    checkpointsReached: string[];
    currentTime: number;
}

export interface LevelState {
    currentLevel: string | null;
    levelProgress: Record<string, LevelProgress>;
    unlockedLevels: string[];
}

