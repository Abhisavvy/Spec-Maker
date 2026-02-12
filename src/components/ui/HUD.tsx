import { useGameStore } from '../../store/gameStore';
import { useLevelManager } from '../../systems/LevelManager';
import './HUD.css';

export function HUD() {
    const velocity = useGameStore((state) => state.velocity);
    const isDashing = useGameStore((state) => state.isDashing);
    const isWallRunning = useGameStore((state) => state.isWallRunning);
    const isSliding = useGameStore((state) => state.isSliding);
    const momentum = useGameStore((state) => state.momentum);
    const { currentLevel, getLevelProgress } = useLevelManager();

    const speed = Math.round(velocity.length() * 10) / 10;
    const progress = currentLevel ? getLevelProgress(currentLevel) : null;
    const time = progress ? Math.round(progress.currentTime * 10) / 10 : 0;
    const bestTime = progress?.bestTime ? Math.round(progress.bestTime * 10) / 10 : null;

    return (
        <div className="hud">
            {/* Top Left - Speed and Status */}
            <div className="hud-top-left">
                <div className="speedometer">
                    <div className="speed-value">{speed.toFixed(1)}</div>
                    <div className="speed-unit">m/s</div>
                </div>
                <div className="status-indicators">
                    {isDashing && <div className="status-badge dash">DASH</div>}
                    {isWallRunning && <div className="status-badge wall-run">WALL RUN</div>}
                    {isSliding && <div className="status-badge slide">SLIDE</div>}
                    {momentum > 1.1 && (
                        <div className="status-badge momentum">
                            MOMENTUM x{momentum.toFixed(1)}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Right - Timer */}
            <div className="hud-top-right">
                <div className="timer">
                    <div className="timer-label">Time</div>
                    <div className="timer-value">{formatTime(time)}</div>
                    {bestTime && (
                        <div className="timer-best">Best: {formatTime(bestTime)}</div>
                    )}
                </div>
            </div>

            {/* Bottom Center - Objective */}
            <div className="hud-bottom-center">
                <div className="objective-text">
                    <div className="objective-label">Objective:</div>
                    <div className="objective-value">Reach the glowing goal!</div>
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

