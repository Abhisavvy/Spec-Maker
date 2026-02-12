import type { LevelState } from '../types/level';
import { useLevelManager } from './LevelManager';
import { useAudioManager } from './AudioManager';

const SAVE_KEY = 'orbital-ballistics-save';
const SETTINGS_KEY = 'orbital-ballistics-settings';

interface SaveData {
    levelState: LevelState;
    timestamp: number;
}

interface SettingsData {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
    mouseSensitivity: number;
}

export class SaveSystem {
    static saveGame(): void {
        const levelState = useLevelManager.getState();
        const saveData: SaveData = {
            levelState: {
                currentLevel: levelState.currentLevel,
                levelProgress: levelState.levelProgress,
                unlockedLevels: levelState.unlockedLevels,
            },
            timestamp: Date.now(),
        };

        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    }

    static loadGame(): boolean {
        try {
            const saveDataStr = localStorage.getItem(SAVE_KEY);
            if (!saveDataStr) return false;

            const saveData: SaveData = JSON.parse(saveDataStr);
            const { loadLevel, unlockLevel } = useLevelManager.getState();

            // Restore level progress
            useLevelManager.setState({
                levelProgress: saveData.levelState.levelProgress,
                unlockedLevels: saveData.levelState.unlockedLevels,
            });

            // Load current level if it exists
            if (saveData.levelState.currentLevel) {
                loadLevel(saveData.levelState.currentLevel);
            }

            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    static saveSettings(): void {
        const audioState = useAudioManager.getState();
        const settingsData: SettingsData = {
            masterVolume: audioState.masterVolume,
            musicVolume: audioState.musicVolume,
            sfxVolume: audioState.sfxVolume,
            muted: audioState.muted,
            mouseSensitivity: 1.0, // TODO: Get from settings store
        };

        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsData));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    static loadSettings(): void {
        try {
            const settingsDataStr = localStorage.getItem(SETTINGS_KEY);
            if (!settingsDataStr) return;

            const settingsData: SettingsData = JSON.parse(settingsDataStr);
            const { setMasterVolume, setMusicVolume, setSfxVolume, setMuted } =
                useAudioManager.getState();

            setMasterVolume(settingsData.masterVolume);
            setMusicVolume(settingsData.musicVolume);
            setSfxVolume(settingsData.sfxVolume);
            setMuted(settingsData.muted);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    static clearSave(): void {
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch (error) {
            console.error('Failed to clear save:', error);
        }
    }

    static hasSave(): boolean {
        return localStorage.getItem(SAVE_KEY) !== null;
    }
}

