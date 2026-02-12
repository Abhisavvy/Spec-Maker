import { useState } from 'react';
import { useAudioManager } from '../../systems/AudioManager';
import './Menu.css';

interface SettingsMenuProps {
    onBack: () => void;
}

export function SettingsMenu({ onBack }: SettingsMenuProps) {
    const [mouseSensitivity, setMouseSensitivity] = useState(1.0);
    const {
        masterVolume,
        musicVolume,
        sfxVolume,
        setMasterVolume,
        setMusicVolume,
        setSfxVolume,
    } = useAudioManager();

    return (
        <div className="menu-overlay">
            <div className="menu-container">
                <h1 className="menu-title">Settings</h1>
                
                <div className="settings-list">
                    <div className="setting-item">
                        <label>Mouse Sensitivity</label>
                        <input
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.1"
                            value={mouseSensitivity}
                            onChange={(e) => setMouseSensitivity(parseFloat(e.target.value))}
                        />
                        <span>{mouseSensitivity.toFixed(1)}x</span>
                    </div>

                    <div className="setting-item">
                        <label>Master Volume</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={masterVolume}
                            onChange={(e) => {
                                const vol = parseFloat(e.target.value);
                                setMasterVolume(vol);
                            }}
                        />
                        <span>{Math.round(masterVolume * 100)}%</span>
                    </div>

                    <div className="setting-item">
                        <label>Music Volume</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={musicVolume}
                            onChange={(e) => {
                                const vol = parseFloat(e.target.value);
                                setMusicVolume(vol);
                            }}
                        />
                        <span>{Math.round(musicVolume * 100)}%</span>
                    </div>

                    <div className="setting-item">
                        <label>SFX Volume</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={sfxVolume}
                            onChange={(e) => {
                                const vol = parseFloat(e.target.value);
                                setSfxVolume(vol);
                            }}
                        />
                        <span>{Math.round(sfxVolume * 100)}%</span>
                    </div>
                </div>

                <button className="menu-button" onClick={onBack}>
                    Back
                </button>
            </div>
        </div>
    );
}

