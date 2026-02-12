import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Vector3, Quaternion } from 'three';
import { CharacterController } from './CharacterController';
import { Level } from './Level';
import { useLevelManager } from '../systems/LevelManager';
import { getLevel } from '../levels';
import { useGameStore } from '../store/gameStore';
import { PHYSICS_CONFIG } from '../utils/constants';
import { SpeedLines } from './effects/SpeedLines';
import { DashTrail } from './effects/DashTrail';
import { LandingImpact } from './effects/LandingImpact';
import { ScreenShake } from './effects/ScreenShake';
import { SoundEffects } from './audio/SoundEffects';
import { GhostPlayer } from './replay/GhostPlayer';
import { PerformanceMonitor } from './debug/PerformanceMonitor';
import { Skybox } from './environment/Skybox';

interface GameProps {
    onGoalReached?: (levelId: string, time: number) => void;
}

/**
 * Main game scene
 * Orchestrates the character controller, camera, and environment
 */
export function Game({ onGoalReached }: GameProps) {
    const cameraRef = useRef<any>(null);
    
    // Camera state - use refs to avoid re-renders
    const cameraPosition = useRef(new Vector3(0, 5, 0));
    const cameraRotation = useRef(new Quaternion());
    
    const { currentLevel, loadLevel } = useLevelManager();
    const setPosition = useGameStore((state) => state.setPosition);
    
    // Load default level on mount
    useEffect(() => {
        if (!currentLevel) {
            loadLevel('level1');
        }
    }, [currentLevel, loadLevel]);
    
    // Get current level data
    const levelData = currentLevel ? getLevel(currentLevel) : null;
    
    // Reset character position when level loads
    useEffect(() => {
        if (levelData) {
            setPosition(levelData.startPosition);
        }
    }, [levelData, setPosition]);

    // Update camera position and rotation from character controller
    // Use refs to avoid state updates that cause jitter
    const handleCameraUpdate = (position: Vector3, rotation: Quaternion) => {
        cameraPosition.current.copy(position);
        cameraRotation.current.copy(rotation);
    };

    // Apply camera transform directly in render loop - NO STATE UPDATES
    useFrame(() => {
        if (cameraRef.current) {
            // Position camera slightly above character (eye height)
            const eyeOffset = new Vector3(0, 1.5, 0);
            const finalPosition = cameraPosition.current.clone().add(eyeOffset);

            // Smooth camera interpolation for position
            cameraRef.current.position.lerp(finalPosition, 0.3);
            
            // Smooth camera rotation interpolation
            cameraRef.current.quaternion.slerp(cameraRotation.current, 0.3);
        }
    });

    return (
        <>
            {/* Skybox */}
            <Skybox />

            {/* Camera */}
            <PerspectiveCamera
                ref={cameraRef}
                makeDefault
                fov={90}
                near={0.1}
                far={1000}
            />

            {/* Enhanced Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[10, 15, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={100}
                shadow-camera-left={-30}
                shadow-camera-right={30}
                shadow-camera-top={30}
                shadow-camera-bottom={-30}
                shadow-bias={-0.0001}
            />
            <pointLight position={[0, 20, 0]} intensity={0.8} color="#ffffff" />
            <pointLight position={[-20, 10, -20]} intensity={0.4} color="#00ff88" />
            <pointLight position={[20, 10, 20]} intensity={0.4} color="#0088ff" />
            <spotLight
                position={[0, 25, 0]}
                angle={0.4}
                penumbra={1}
                intensity={0.6}
                castShadow
                color="#ffffff"
            />

            {/* Physics World */}
            <Physics gravity={[0, PHYSICS_CONFIG.GRAVITY, 0]}>
                <CharacterController onCameraUpdate={handleCameraUpdate} />
                {levelData && (
                    <>
                        <Level levelData={levelData} onGoalReached={onGoalReached} />
                        <GhostPlayer levelId={currentLevel || 'level1'} enabled={false} />
                    </>
                )}
            </Physics>

            {/* Visual Effects */}
            <SpeedLines />
            <DashTrail />
            <LandingImpact />
            <ScreenShake />

            {/* Audio */}
            <SoundEffects />

            {/* Debug */}
            {import.meta.env.DEV && <PerformanceMonitor />}
        </>
    );
}
