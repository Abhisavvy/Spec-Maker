import { useEffect, useState } from 'react';
import './LevelCompleteModal.css';

interface LevelCompleteModalProps {
    time: number;
    bestTime?: number;
    collectiblesFound: number;
    totalCollectibles: number;
    onContinue: () => void;
    onRetry: () => void;
}

export function LevelCompleteModal({
    time,
    bestTime,
    collectiblesFound,
    totalCollectibles,
    onContinue,
    onRetry,
}: LevelCompleteModalProps) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Auto-hide after 5 seconds if user doesn't interact
        const timer = setTimeout(() => {
            setShow(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    const isNewBest = bestTime === undefined || time < bestTime;
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <div className="level-complete-overlay">
            <div className="level-complete-modal">
                <div className="modal-header">
                    <h1>LEVEL COMPLETE!</h1>
                    {isNewBest && <div className="new-best-badge">NEW BEST TIME!</div>}
                </div>

                <div className="modal-stats">
                    <div className="stat-item">
                        <div className="stat-label">Time</div>
                        <div className="stat-value">{formatTime(time)}</div>
                    </div>

                    {bestTime && (
                        <div className="stat-item">
                            <div className="stat-label">Best Time</div>
                            <div className="stat-value">{formatTime(bestTime)}</div>
                        </div>
                    )}

                    <div className="stat-item">
                        <div className="stat-label">Collectibles</div>
                        <div className="stat-value">
                            {collectiblesFound} / {totalCollectibles}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-primary" onClick={onContinue}>
                        Continue
                    </button>
                    <button className="btn-secondary" onClick={onRetry}>
                        Retry
                    </button>
                </div>
            </div>
        </div>
    );
}

