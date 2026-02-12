import './Menu.css';

interface PauseMenuProps {
    onResume: () => void;
    onRestart: () => void;
    onLevelSelect: () => void;
    onMainMenu: () => void;
}

export function PauseMenu({
    onResume,
    onRestart,
    onLevelSelect,
    onMainMenu,
}: PauseMenuProps) {
    return (
        <div className="menu-overlay">
            <div className="menu-container">
                <h1 className="menu-title">PAUSED</h1>
                
                <div className="menu-buttons">
                    <button className="menu-button primary" onClick={onResume}>
                        Resume
                    </button>
                    <button className="menu-button" onClick={onRestart}>
                        Restart Level
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

