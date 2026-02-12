import { create } from 'zustand';

interface AudioSettings {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
}

interface AudioManagerStore extends AudioSettings {
    // Audio contexts and sources
    musicAudio: HTMLAudioElement | null;
    sfxAudio: Map<string, HTMLAudioElement>;
    
    // Actions
    setMasterVolume: (volume: number) => void;
    setMusicVolume: (volume: number) => void;
    setSfxVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
    playMusic: (url: string, loop?: boolean) => void;
    stopMusic: () => void;
    playSound: (url: string, volume?: number) => void;
    preloadSound: (url: string, id: string) => void;
}

export const useAudioManager = create<AudioManagerStore>((set, get) => ({
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 1.0,
    muted: false,
    musicAudio: null,
    sfxAudio: new Map(),

    setMasterVolume: (volume: number) => {
        set({ masterVolume: volume });
        const state = get();
        if (state.musicAudio) {
            state.musicAudio.volume = state.musicVolume * state.masterVolume * (state.muted ? 0 : 1);
        }
    },

    setMusicVolume: (volume: number) => {
        set({ musicVolume: volume });
        const state = get();
        if (state.musicAudio) {
            state.musicAudio.volume = volume * state.masterVolume * (state.muted ? 0 : 1);
        }
    },

    setSfxVolume: (volume: number) => {
        set({ sfxVolume: volume });
    },

    setMuted: (muted: boolean) => {
        set({ muted });
        const state = get();
        if (state.musicAudio) {
            state.musicAudio.volume = state.musicVolume * state.masterVolume * (muted ? 0 : 1);
        }
    },

    playMusic: (url: string, loop = true) => {
        const state = get();
        
        // Stop current music
        if (state.musicAudio) {
            state.musicAudio.pause();
            state.musicAudio = null;
        }

        // Play new music
        const audio = new Audio(url);
        audio.loop = loop;
        audio.volume = state.musicVolume * state.masterVolume * (state.muted ? 0 : 1);
        audio.play().catch((err) => {
            console.warn('Failed to play music:', err);
        });

        set({ musicAudio: audio });
    },

    stopMusic: () => {
        const state = get();
        if (state.musicAudio) {
            state.musicAudio.pause();
            state.musicAudio.currentTime = 0;
            set({ musicAudio: null });
        }
    },

    playSound: (url: string, volume = 1.0) => {
        const state = get();
        if (state.muted) return;

        // Check if sound is preloaded
        const preloaded = state.sfxAudio.get(url);
        if (preloaded) {
            const audio = preloaded.cloneNode() as HTMLAudioElement;
            audio.volume = volume * state.sfxVolume * state.masterVolume;
            audio.play().catch((err) => {
                console.warn('Failed to play sound:', err);
            });
        } else {
            // Load and play on the fly
            const audio = new Audio(url);
            audio.volume = volume * state.sfxVolume * state.masterVolume;
            audio.play().catch((err) => {
                console.warn('Failed to play sound:', err);
            });
        }
    },

    preloadSound: (url: string, id: string) => {
        const state = get();
        const audio = new Audio(url);
        audio.preload = 'auto';
        state.sfxAudio.set(id, audio);
        set({ sfxAudio: new Map(state.sfxAudio) });
    },
}));

// Sound effect IDs (placeholder - actual sounds would be loaded)
export const SOUNDS = {
    JUMP: 'jump',
    DASH: 'dash',
    LAND: 'land',
    COLLECT: 'collect',
    CHECKPOINT: 'checkpoint',
    GOAL: 'goal',
    WALL_RUN: 'wall_run',
    SLIDE: 'slide',
} as const;

