import { Vector3, Quaternion } from 'three';
import { create } from 'zustand';

interface ReplayFrame {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
    timestamp: number;
}

interface ReplayData {
    levelId: string;
    frames: ReplayFrame[];
    totalTime: number;
}

interface ReplaySystemStore {
    currentReplay: ReplayData | null;
    bestReplays: Record<string, ReplayData>;
    
    startRecording: (levelId: string) => void;
    recordFrame: (position: Vector3, rotation: Quaternion) => void;
    stopRecording: () => ReplayData | null;
    saveReplay: (replay: ReplayData) => void;
    loadBestReplay: (levelId: string) => ReplayData | null;
    clearReplay: (levelId: string) => void;
}

export const useReplaySystem = create<ReplaySystemStore>((set, get) => {
    const loadBestReplays = (): Record<string, ReplayData> => {
        try {
            const stored = localStorage.getItem('orbital-ballistics-replays');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load replays:', error);
        }
        return {};
    };

    const saveBestReplays = (replays: Record<string, ReplayData>) => {
        try {
            localStorage.setItem('orbital-ballistics-replays', JSON.stringify(replays));
        } catch (error) {
            console.error('Failed to save replays:', error);
        }
    };

    return {
        currentReplay: null,
        bestReplays: loadBestReplays(),

        startRecording: (levelId: string) => {
            set({
                currentReplay: {
                    levelId,
                    frames: [],
                    totalTime: 0,
                },
            });
        },

        recordFrame: (position: Vector3, rotation: Quaternion) => {
            const state = get();
            if (!state.currentReplay) return;

            const startTime = state.currentReplay.frames[0]?.timestamp || Date.now();
            const frame: ReplayFrame = {
                position: { x: position.x, y: position.y, z: position.z },
                rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
                timestamp: Date.now() - startTime,
            };

            set({
                currentReplay: {
                    ...state.currentReplay,
                    frames: [...state.currentReplay.frames, frame],
                },
            });
        },

        stopRecording: () => {
            const state = get();
            if (!state.currentReplay) return null;

            const replay = {
                ...state.currentReplay,
                totalTime: state.currentReplay.frames[state.currentReplay.frames.length - 1]?.timestamp || 0,
            };

            set({ currentReplay: null });
            return replay;
        },

        saveReplay: (replay: ReplayData) => {
            const state = get();
            const existing = state.bestReplays[replay.levelId];
            
            // Only save if it's better (faster time) or no existing replay
            if (!existing || replay.totalTime < existing.totalTime) {
                const newReplays = {
                    ...state.bestReplays,
                    [replay.levelId]: replay,
                };
                set({ bestReplays: newReplays });
                saveBestReplays(newReplays);
            }
        },

        loadBestReplay: (levelId: string) => {
            const state = get();
            return state.bestReplays[levelId] || null;
        },

        clearReplay: (levelId: string) => {
            const state = get();
            const newReplays = { ...state.bestReplays };
            delete newReplays[levelId];
            set({ bestReplays: newReplays });
            saveBestReplays(newReplays);
        },
    };
});

