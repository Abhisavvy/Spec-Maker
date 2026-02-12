import { Vector3 } from 'three';
import type { LevelData } from '../types/level';

export const Level2Data: LevelData = {
    id: 'level2',
    name: 'Wall Runner',
    description: 'Master wall-running and advanced movement',
    startPosition: new Vector3(0, 5, 0),
    checkpoints: [
        {
            id: 'cp1',
            position: new Vector3(15, 5, 0),
        },
        {
            id: 'cp2',
            position: new Vector3(30, 10, 0),
        },
    ],
    collectibles: [
        {
            id: 'coin1',
            position: new Vector3(8, 3, 0),
            type: 'coin',
        },
        {
            id: 'coin2',
            position: new Vector3(25, 8, 0),
            type: 'coin',
        },
        {
            id: 'coin3',
            position: new Vector3(35, 12, 0),
            type: 'coin',
        },
    ],
    platforms: [
        {
            id: 'ground',
            position: new Vector3(0, -0.25, 0),
            size: new Vector3(50, 0.5, 50),
            type: 'static',
        },
        {
            id: 'wall1',
            position: new Vector3(-10, 5, 0),
            size: new Vector3(0.5, 10, 15),
            type: 'static',
        },
        {
            id: 'platform1',
            position: new Vector3(15, 3, 0),
            size: new Vector3(5, 0.5, 5),
            type: 'static',
        },
        {
            id: 'wall2',
            position: new Vector3(20, 8, 0),
            size: new Vector3(0.5, 10, 10),
            type: 'static',
        },
        {
            id: 'platform2',
            position: new Vector3(30, 6, 0),
            size: new Vector3(5, 0.5, 5),
            type: 'static',
        },
    ],
    obstacles: [
        {
            id: 'obstacle1',
            position: new Vector3(12, 1, 0),
            size: new Vector3(1, 1, 1),
            type: 'static',
        },
    ],
    goal: {
        id: 'goal2',
        position: new Vector3(40, 8, 0),
        size: new Vector3(2, 2, 2),
    },
    timeLimit: 90,
    requiredCollectibles: 3,
};

