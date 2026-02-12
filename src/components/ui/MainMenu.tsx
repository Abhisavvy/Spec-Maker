// Unused imports removed
import './Menu.css';

interface MainMenuProps {
    onStart: () => void;
    onLevelSelect: () => void;
    onSettings: () => void;
}

export function MainMenu({ onStart, onLevelSelect, onSettings }: MainMenuProps) {
    // Add inline styles as fallback in case CSS doesn't load
    return (
        <div 
            className="menu-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.95)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
            }}
        >
            <div 
                className="menu-container"
                style={{
                    background: 'rgba(20, 20, 20, 0.95)',
                    border: '2px solid #00ff88',
                    borderRadius: '10px',
                    padding: '40px',
                    maxWidth: '600px',
                    width: '90%',
                    boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
                }}
            >
                <h1 
                    className="menu-title"
                    style={{
                        color: '#00ff88',
                        textAlign: 'center',
                        fontSize: '48px',
                        margin: '0 0 10px 0',
                        textShadow: '0 0 20px #00ff88',
                    }}
                >
                    ORBITAL BALLISTICS
                </h1>
                <p 
                    className="menu-subtitle"
                    style={{
                        color: '#888',
                        textAlign: 'center',
                        fontSize: '18px',
                        margin: '0 0 30px 0',
                    }}
                >
                    6DOF Platformer
                </p>
                
                <div className="menu-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button 
                        className="menu-button primary" 
                        onClick={onStart}
                        style={{
                            padding: '15px 30px',
                            fontSize: '18px',
                            background: '#00ff88',
                            color: '#000',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        Start Game
                    </button>
                    <button 
                        className="menu-button" 
                        onClick={onLevelSelect}
                        style={{
                            padding: '15px 30px',
                            fontSize: '18px',
                            background: 'transparent',
                            color: '#00ff88',
                            border: '2px solid #00ff88',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Level Select
                    </button>
                    <button 
                        className="menu-button" 
                        onClick={onSettings}
                        style={{
                            padding: '15px 30px',
                            fontSize: '18px',
                            background: 'transparent',
                            color: '#00ff88',
                            border: '2px solid #00ff88',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Settings
                    </button>
                </div>

                <div className="menu-controls" style={{ marginTop: '30px', color: '#888' }}>
                    <h3 style={{ color: '#00ff88', marginBottom: '10px' }}>Controls</h3>
                    <div className="controls-list" style={{ fontSize: '14px', lineHeight: '1.8' }}>
                        <div>WASD / Arrows - Move</div>
                        <div>Mouse - Look</div>
                        <div>Space - Jump / Double Jump</div>
                        <div>Shift - Dash / Slide</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

