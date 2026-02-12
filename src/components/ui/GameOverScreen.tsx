import { useLevelManager } from '../../systems/LevelManager';
import './Menu.css';

interface GameOverScreenProps {
    levelId: string;
    time: number;
    onRestart: () => void;
    onNextLevel: () => void;
    onLevelSelect: () => void;
    onMainMenu: () => void;
}

export function GameOverScreen({
    levelId,
    time,
    onRestart,
    onNextLevel,
    onLevelSelect,
    onMainMenu,
}: GameOverScreenProps) {
    const { getLevelProgress } = useLevelManager();
    const progress = getLevelProgress(levelId);
    const bestTime = progress?.bestTime;
    const isNewRecord = bestTime && time < bestTime;

    return (
        <div className="menu-overlay">
            <div className="menu-container">
                <h1 className="menu-title">Level Complete!</h1>
                
                <div className="completion-stats">
                    <div className="stat-item">
                        <div className="stat-label">Time</div>
                        <div className="stat-value">{formatTime(time)}</div>
                    </div>
                    {bestTime && (
                        <div className="stat-item">
                            <div className="stat-label">Best Time</div>
                            <div className={`stat-value ${isNewRecord ? 'new-record' : ''}`}>
                                {formatTime(bestTime)}
                                {isNewRecord && ' 🎉'}
                            </div>
                        </div>
                    )}
                </div>

                <div className="menu-buttons">
                    <button className="menu-button primary" onClick={onNextLevel}>
                        Next Level
                    </button>
                    <button className="menu-button" onClick={onRestart}>
                        Restart
                    </button>
                    <button className="menu-button" onClick={onLevelSelect}>
                        Level Select
                    </button>
                    <button className="menu-button" onClick={onMainMenu}>
                        Main Menu
                    </button>
                </div>
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

