import { create } from 'zustand';
import type { LevelData, LevelProgress, LevelState } from '../types/level';

interface LevelManagerStore extends LevelState {
    // Actions
    loadLevel: (levelId: string) => void;
    completeLevel: (levelId: string, time: number) => void;
    save: () => void;
    reachCheckpoint: (levelId: string, checkpointId: string) => void;
    collectItem: (levelId: string, collectibleId: string) => void;
    unlockLevel: (levelId: string) => void;
    resetLevel: (levelId: string) => void;
    updateTime: (levelId: string, time: number) => void;
    getLevelProgress: (levelId: string) => LevelProgress | null;
    isLevelUnlocked: (levelId: string) => boolean;
}

const initialProgress: LevelProgress = {
    levelId: '',
    completed: false,
    bestTime: undefined,
    collectiblesFound: [],
    checkpointsReached: [],
    currentTime: 0,
};

export const useLevelManager = create<LevelManagerStore>((set, get) => ({
    currentLevel: null,
    levelProgress: {},
    unlockedLevels: ['level1'], // First level always unlocked

    loadLevel: (levelId: string) => {
        set({ currentLevel: levelId });
        
        // Initialize progress if it doesn't exist
        const state = get();
        if (!state.levelProgress[levelId]) {
            set({
                levelProgress: {
                    ...state.levelProgress,
                    [levelId]: {
                        ...initialProgress,
                        levelId,
                    },
                },
            });
        } else {
            // Reset current time when loading level
            set({
                levelProgress: {
                    ...state.levelProgress,
                    [levelId]: {
                        ...state.levelProgress[levelId],
                        currentTime: 0,
                    },
                },
            });
        }
    },

    completeLevel: (levelId: string, time: number) => {
        const state = get();
        const progress = state.levelProgress[levelId] || { ...initialProgress, levelId };
        
        console.log('Completing level:', levelId, 'Time:', time);
        
        const updatedProgress: LevelProgress = {
            ...progress,
            completed: true,
            currentTime: time,
            bestTime: progress.bestTime
                ? Math.min(progress.bestTime, time)
                : time,
        };

        set({
            levelProgress: {
                ...state.levelProgress,
                [levelId]: updatedProgress,
            },
        });

        // Unlock next level
        const levelNumber = parseInt(levelId.replace('level', ''));
        const nextLevelId = `level${levelNumber + 1}`;
        if (!state.unlockedLevels.includes(nextLevelId)) {
            set({
                unlockedLevels: [...state.unlockedLevels, nextLevelId],
            });
        }

        // Trigger level complete event
        const event = new CustomEvent('levelComplete', {
            detail: { levelId, time, bestTime: updatedProgress.bestTime }
        });
        window.dispatchEvent(event);

        // Auto-save on level completion
        get().save();
    },

    save: () => {
        // Save is handled by SaveSystem.saveGame()
    },

    reachCheckpoint: (levelId: string, checkpointId: string) => {
        const state = get();
        const progress = state.levelProgress[levelId];
        
        if (progress && !progress.checkpointsReached.includes(checkpointId)) {
            set({
                levelProgress: {
                    ...state.levelProgress,
                    [levelId]: {
                        ...progress,
                        checkpointsReached: [...progress.checkpointsReached, checkpointId],
                    },
                },
            });
        }
    },

    collectItem: (levelId: string, collectibleId: string) => {
        const state = get();
        const progress = state.levelProgress[levelId];
        
        if (progress && !progress.collectiblesFound.includes(collectibleId)) {
            console.log('Collecting item:', collectibleId, 'in level:', levelId);
            set({
                levelProgress: {
                    ...state.levelProgress,
                    [levelId]: {
                        ...progress,
                        collectiblesFound: [...progress.collectiblesFound, collectibleId],
                    },
                },
            });
            // Trigger visual/audio feedback
            const event = new CustomEvent('collectibleCollected', {
                detail: { levelId, collectibleId }
            });
            window.dispatchEvent(event);
        }
    },

    unlockLevel: (levelId: string) => {
        const state = get();
        if (!state.unlockedLevels.includes(levelId)) {
            set({
                unlockedLevels: [...state.unlockedLevels, levelId],
            });
        }
    },

    resetLevel: (levelId: string) => {
        const state = get();
        set({
            levelProgress: {
                ...state.levelProgress,
                [levelId]: {
                    ...initialProgress,
                    levelId,
                },
            },
        });
    },

    updateTime: (levelId: string, time: number) => {
        const state = get();
        const progress = state.levelProgress[levelId];
        
        if (progress) {
            set({
                levelProgress: {
                    ...state.levelProgress,
                    [levelId]: {
                        ...progress,
                        currentTime: time,
                    },
                },
            });
        }
    },

    getLevelProgress: (levelId: string) => {
        const state = get();
        return state.levelProgress[levelId] || null;
    },

    isLevelUnlocked: (levelId: string) => {
        const state = get();
        return state.unlockedLevels.includes(levelId);
    },
}));

