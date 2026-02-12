import { useLevelManager } from '../../systems/LevelManager';
import { getAllLevels } from '../../levels';
import './Menu.css';

interface LevelSelectProps {
    onBack: () => void;
    onSelect: (levelId: string) => void;
}

export function LevelSelect({ onBack, onSelect }: LevelSelectProps) {
    const { isLevelUnlocked, getLevelProgress } = useLevelManager();
    const levels = getAllLevels();

    return (
        <div className="menu-overlay">
            <div className="menu-container">
                <h1 className="menu-title">Select Level</h1>
                
                <div className="level-list">
                    {levels.map((level) => {
                        const unlocked = isLevelUnlocked(level.id);
                        const progress = getLevelProgress(level.id);
                        const completed = progress?.completed || false;
                        const bestTime = progress?.bestTime;

                        return (
                            <div
                                key={level.id}
                                className={`level-item ${unlocked ? '' : 'locked'} ${completed ? 'completed' : ''}`}
                                onClick={() => {
                                    if (unlocked) {
                                        onSelect(level.id);
                                    }
                                }}
                            >
                                <div className="level-info">
                                    <div className="level-name">{level.name}</div>
                                    <div className="level-description">{level.description}</div>
                                    {bestTime && (
                                        <div className="level-best-time">
                                            Best: {formatTime(bestTime)}
                                        </div>
                                    )}
                                </div>
                                <div className="level-status">
                                    {!unlocked && <span className="lock-icon">🔒</span>}
                                    {completed && <span className="check-icon">✓</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="menu-button" onClick={onBack}>
                    Back
                </button>
            </div>
        </div>
    );
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

