import { Level1Data } from './Level1';
import { Level2Data } from './Level2';
import type { LevelData } from '../types/level';

export const levels: Record<string, LevelData> = {
    level1: Level1Data,
    level2: Level2Data,
};

export function getLevel(levelId: string): LevelData | null {
    return levels[levelId] || null;
}

export function getAllLevels(): LevelData[] {
    return Object.values(levels);
}

