import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Game } from './components/Game';
import { DebugOverlay } from './components/DebugOverlay';
import { HUD } from './components/ui/HUD';
import { MainMenu } from './components/ui/MainMenu';
import { LevelSelect } from './components/ui/LevelSelect';
import { PauseMenu } from './components/ui/PauseMenu';
import { SettingsMenu } from './components/ui/SettingsMenu';
import { GameOverScreen } from './components/ui/GameOverScreen';
import { keyboardControlsMap } from './components/CharacterController';
import { useLevelManager } from './systems/LevelManager';
import { SaveSystem } from './systems/SaveSystem';
// import { useAudioManager } from './systems/AudioManager'; // Not used yet
import './App.css';

type GameState = 'menu' | 'level-select' | 'settings' | 'playing' | 'paused' | 'game-over';

/**
 * Main application entry point
 * Sets up the R3F Canvas with physics and controls
 */
function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [completedLevelId, setCompletedLevelId] = useState<string | null>(null);
  const [completedTime, setCompletedTime] = useState<number>(0);
  const { loadLevel, currentLevel, resetLevel } = useLevelManager();

  // Debug: Log state changes
  useEffect(() => {
    console.log('App rendered, gameState:', gameState);
  }, [gameState]);

  // Load save data on mount
  useEffect(() => {
    SaveSystem.loadSettings();
    SaveSystem.loadGame();
  }, []);

  // Auto-save on level completion
  useEffect(() => {
    if (gameState === 'game-over') {
      SaveSystem.saveGame();
    }
  }, [gameState]);

  // Handle pause with Escape key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
          document.exitPointerLock();
        } else if (gameState === 'paused') {
          setGameState('playing');
          document.body.requestPointerLock();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  const handleStart = () => {
    loadLevel('level1');
    setGameState('playing');
  };

  const handleLevelSelect = (levelId: string) => {
    loadLevel(levelId);
    setGameState('playing');
  };

  const handleGoalReached = (levelId: string, time: number) => {
    setCompletedLevelId(levelId);
    setCompletedTime(time);
    setGameState('game-over');
    document.exitPointerLock();
  };

  const handleNextLevel = () => {
    if (completedLevelId) {
      const levelNum = parseInt(completedLevelId.replace('level', ''));
      const nextLevelId = `level${levelNum + 1}`;
      loadLevel(nextLevelId);
      setGameState('playing');
      setCompletedLevelId(null);
    }
  };

  const handleRestart = () => {
    if (currentLevel) {
      resetLevel(currentLevel);
      loadLevel(currentLevel);
      setGameState('playing');
      setCompletedLevelId(null);
    }
  };

  const showGame = gameState === 'playing' || gameState === 'paused';

  // Always show something, even if there's an error
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* Debug overlay - always visible */}
      <div style={{
        position: 'fixed',
        top: 10,
        left: 10,
        background: 'rgba(255, 0, 0, 0.9)',
        color: '#fff',
        padding: '10px',
        zIndex: 99999,
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '2px solid #fff'
      }}>
        Debug: gameState = {gameState}
        <br />
        React App Loaded
      </div>
      
      <KeyboardControls map={keyboardControlsMap}>
        {showGame && (
          <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 90 }}
            gl={{ antialias: true }}
          >
            {/* Fog for depth perception */}
            <fog attach="fog" args={['#000000', 30, 100]} />

            <Game onGoalReached={handleGoalReached} />
          </Canvas>
        )}
      </KeyboardControls>

      {/* UI Overlays */}
      {showGame && <HUD />}
      
      {gameState === 'menu' && (
        <MainMenu
          onStart={handleStart}
          onLevelSelect={() => setGameState('level-select')}
          onSettings={() => setGameState('settings')}
        />
      )}

      {gameState === 'level-select' && (
        <LevelSelect
          onBack={() => setGameState('menu')}
          onSelect={handleLevelSelect}
        />
      )}

      {gameState === 'settings' && (
        <SettingsMenu onBack={() => setGameState('menu')} />
      )}

      {gameState === 'paused' && (
        <PauseMenu
          onResume={() => {
            setGameState('playing');
            document.body.requestPointerLock();
          }}
          onRestart={handleRestart}
          onLevelSelect={() => setGameState('level-select')}
          onMainMenu={() => {
            setGameState('menu');
            setCompletedLevelId(null);
          }}
        />
      )}

      {gameState === 'game-over' && completedLevelId && (
        <GameOverScreen
          levelId={completedLevelId}
          time={completedTime}
          onRestart={handleRestart}
          onNextLevel={handleNextLevel}
          onLevelSelect={() => setGameState('level-select')}
          onMainMenu={() => {
            setGameState('menu');
            setCompletedLevelId(null);
          }}
        />
      )}

      {/* HTML Debug Overlay */}
      {showGame && <DebugOverlay />}

      {/* Crosshair */}
      {showGame && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '4px',
          height: '4px',
          background: '#00ff00',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999,
          boxShadow: '0 0 10px #00ff00'
        }} />
      )}
    </div>
  );
}

export default App;
