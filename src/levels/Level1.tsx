import { Vector3 } from 'three';
import type { LevelData } from '../types/level';

export const Level1Data: LevelData = {
    id: 'level1',
    name: 'Tutorial',
    description: 'Learn the basics of movement',
    startPosition: new Vector3(0, 5, 0),
    checkpoints: [
        {
            id: 'cp1',
            position: new Vector3(10, 2, 0),
        },
    ],
    collectibles: [
        {
            id: 'coin1',
            position: new Vector3(5, 3, 0),
            type: 'coin',
        },
        {
            id: 'coin2',
            position: new Vector3(15, 4, 0),
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
            id: 'platform1',
            position: new Vector3(10, 2, 0),
            size: new Vector3(5, 0.5, 5),
            type: 'static',
        },
        {
            id: 'platform2',
            position: new Vector3(20, 4, 0),
            size: new Vector3(5, 0.5, 5),
            type: 'static',
        },
    ],
    obstacles: [],
    goal: {
        id: 'goal1',
        position: new Vector3(25, 2, 0),
        size: new Vector3(2, 2, 2),
    },
    timeLimit: 60,
    requiredCollectibles: 2,
};

