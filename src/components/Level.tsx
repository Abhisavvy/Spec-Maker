import { useEffect, useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Vector3, Quaternion } from 'three';
import { Box, Sphere, Text } from '@react-three/drei';
import { EnhancedPlatform } from './environment/EnhancedPlatform';
import { AssetPlatform } from './environment/AssetPlatform';
import { EnhancedCollectible } from './environment/EnhancedCollectible';
import { EnhancedCheckpoint } from './environment/EnhancedCheckpoint';
import { Ground } from './environment/Ground';
import { AssetGround } from './environment/AssetGround';
import { AssetLoader } from '../utils/assetLoader';
import { ASSET_CONFIG } from '../config/assets';
import type { LevelData } from '../types/level';
import { useLevelManager } from '../systems/LevelManager';
import { useGameStore } from '../store/gameStore';
import { useReplaySystem } from '../systems/ReplaySystem';

interface LevelProps {
    levelData: LevelData;
    onGoalReached?: (levelId: string, time: number) => void;
}

/**
 * Base Level component that renders a level from LevelData
 */
export function Level({ levelData, onGoalReached }: LevelProps) {
    const { collectItem, reachCheckpoint, updateTime, getLevelProgress } = useLevelManager();
    const { startRecording, stopRecording, saveReplay } = useReplaySystem();
    const position = useGameStore((state) => state.position);
    const startTimeRef = useRef<number>(Date.now());
    const goalReachedRef = useRef<boolean>(false);

    // Initialize timer and start replay recording
    useEffect(() => {
        startTimeRef.current = Date.now();
        goalReachedRef.current = false;
        startRecording(levelData.id);
        
        return () => {
            // Stop recording when level unloads
            const replay = stopRecording();
            if (replay) {
                saveReplay(replay);
            }
        };
    }, [levelData.id, startRecording, stopRecording, saveReplay]);

    // Update timer
    useFrame(() => {
        if (!goalReachedRef.current) {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            updateTime(levelData.id, elapsed);
        }
    });

    // Check goal collision - use useFrame for real-time checking
    useFrame(() => {
        if (goalReachedRef.current) return;

        const goalPos = new Vector3(
            levelData.goal.position.x,
            levelData.goal.position.y,
            levelData.goal.position.z
        );
        const distance = position.distanceTo(goalPos);
        
        if (distance < 2.5) {
            goalReachedRef.current = true;
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            console.log('Goal reached!', levelData.id, elapsed);
            const { completeLevel } = useLevelManager.getState();
            completeLevel(levelData.id, elapsed);
            
            if (onGoalReached) {
                onGoalReached(levelData.id, elapsed);
            }
        }
    });

    return (
        <group>
            {/* Ground - use AssetGround if textures configured, otherwise fallback */}
            {ASSET_CONFIG.ground.albedo ? (
                <AssetGround size={100} position={[0, -0.25, 0]} />
            ) : (
                <Ground size={100} position={[0, -0.25, 0]} />
            )}
            
            {/* Platforms - use AssetPlatform if models/textures configured, otherwise fallback */}
            {levelData.platforms.map((platform) => (
                ASSET_CONFIG.models.platform || ASSET_CONFIG.platform.albedo ? (
                    <AssetPlatform key={platform.id} platform={platform} />
                ) : (
                    <EnhancedPlatform key={platform.id} platform={platform} />
                )
            ))}

            {/* Obstacles */}
            {levelData.obstacles.map((obstacle) => (
                <Obstacle key={obstacle.id} obstacle={obstacle} />
            ))}

            {/* Collectibles - using enhanced version */}
            {levelData.collectibles.map((collectible) => {
                const progress = getLevelProgress(levelData.id);
                const collected = progress?.collectiblesFound.includes(collectible.id) || false;
                return (
                    <group key={collectible.id}>
                        <EnhancedCollectible
                            collectible={collectible}
                            collected={collected}
                        />
                        <Collectible
                            collectible={collectible}
                            levelId={levelData.id}
                            onCollect={() => collectItem(levelData.id, collectible.id)}
                        />
                    </group>
                );
            })}

            {/* Checkpoints - using enhanced version */}
            {levelData.checkpoints.map((checkpoint) => {
                const progress = getLevelProgress(levelData.id);
                const reached = progress?.checkpointsReached.includes(checkpoint.id) || false;
                return (
                    <group key={checkpoint.id}>
                        <EnhancedCheckpoint
                            checkpoint={checkpoint}
                            reached={reached}
                        />
                        <Checkpoint
                            checkpoint={checkpoint}
                            levelId={levelData.id}
                            onReach={() => reachCheckpoint(levelData.id, checkpoint.id)}
                        />
                    </group>
                );
            })}

            {/* Goal */}
            <Goal goal={levelData.goal} />
        </group>
    );
}

// Platform component
function Platform({ platform }: { platform: LevelData['platforms'][0] }) {
    const posRef = useRef(new Vector3(platform.position.x, platform.position.y, platform.position.z));
    const rotationRef = useRef(new Vector3(
        platform.rotation?.x || 0,
        platform.rotation?.y || 0,
        platform.rotation?.z || 0
    ));
    const rigidBodyRef = useRef<any>(null);
    const moveIndexRef = useRef(0);
    const moveProgressRef = useRef(0);

    // Handle moving platforms
    useFrame((state, delta) => {
        if (!rigidBodyRef.current) return;

        if (platform.type === 'moving' && platform.movePath && platform.movePath.length > 1) {
            const moveSpeed = platform.moveSpeed || 1;
            moveProgressRef.current += delta * moveSpeed;

            const path = platform.movePath;
            const totalLength = path.length;
            const currentIndex = Math.floor(moveProgressRef.current) % (totalLength * 2);
            const normalizedIndex = currentIndex < totalLength
                ? currentIndex
                : totalLength * 2 - currentIndex - 1;

            const start = path[normalizedIndex];
            const end = path[(normalizedIndex + 1) % totalLength];
            const t = (moveProgressRef.current % 1);

            posRef.current.lerpVectors(start, end, t);
            rigidBodyRef.current.setTranslation({
                x: posRef.current.x,
                y: posRef.current.y,
                z: posRef.current.z,
            });
        }

        if (platform.type === 'rotating' && platform.rotateSpeed) {
            rotationRef.current.x += platform.rotateSpeed.x * delta;
            rotationRef.current.y += platform.rotateSpeed.y * delta;
            rotationRef.current.z += platform.rotateSpeed.z * delta;
            rigidBodyRef.current.setRotation({
                x: rotationRef.current.x,
                y: rotationRef.current.y,
                z: rotationRef.current.z,
                w: 1,
            });
        }
    });

    const pos = platform.position;
    
    return (
        <RigidBody
            ref={rigidBodyRef}
            type={platform.type === 'static' ? 'fixed' : 'kinematicPosition'}
            colliders="cuboid"
        >
            <Box
                args={[platform.size.x, platform.size.y, platform.size.z]}
                position={[pos.x, pos.y, pos.z]}
                rotation={platform.rotation ? [platform.rotation.x, platform.rotation.y, platform.rotation.z] : [0, 0, 0]}
            >
                <meshStandardMaterial color="#3a3a3a" />
            </Box>
        </RigidBody>
    );
}

// Obstacle component
function Obstacle({ obstacle }: { obstacle: LevelData['obstacles'][0] }) {
    const posRef = useRef(new Vector3(obstacle.position.x, obstacle.position.y, obstacle.position.z));
    const rotationRef = useRef(new Vector3(
        obstacle.rotation?.x || 0,
        obstacle.rotation?.y || 0,
        obstacle.rotation?.z || 0
    ));
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const moveIndexRef = useRef(0);
    const moveProgressRef = useRef(0);
    
    // Use professional or fallback material
    const [material, setMaterial] = useState<any>(null);
    
    useEffect(() => {
        const loadMaterial = async () => {
            if (ASSET_CONFIG.obstacle.albedo) {
                try {
                    const mat = await AssetLoader.loadObstacleMaterial();
                    setMaterial(mat);
                } catch (error) {
                    console.warn('Failed to load obstacle textures, using fallback:', error);
                    setMaterial(AssetLoader.createMetallicMaterial());
                }
            } else {
                setMaterial(AssetLoader.createMetallicMaterial());
            }
        };
        loadMaterial();
    }, []);

    // Handle moving/rotating obstacles
    useFrame((state, delta) => {
        if (!rigidBodyRef.current) return;

        if (obstacle.type === 'moving' && obstacle.movePath && obstacle.movePath.length > 1) {
            const moveSpeed = obstacle.moveSpeed || 1;
            moveProgressRef.current += delta * moveSpeed;

            const path = obstacle.movePath;
            const totalLength = path.length;
            const currentIndex = Math.floor(moveProgressRef.current) % (totalLength * 2);
            const normalizedIndex = currentIndex < totalLength
                ? currentIndex
                : totalLength * 2 - currentIndex - 1;

            const start = path[normalizedIndex];
            const end = path[(normalizedIndex + 1) % totalLength];
            const t = (moveProgressRef.current % 1);

            posRef.current.lerpVectors(start, end, t);
            rigidBodyRef.current.setTranslation({
                x: posRef.current.x,
                y: posRef.current.y,
                z: posRef.current.z,
            });
        }

        if (obstacle.type === 'rotating' && obstacle.rotateSpeed) {
            rotationRef.current.x += obstacle.rotateSpeed.x * delta;
            rotationRef.current.y += obstacle.rotateSpeed.y * delta;
            rotationRef.current.z += obstacle.rotateSpeed.z * delta;
            
            const quat = new Quaternion().setFromEuler(
                new Vector3(rotationRef.current.x, rotationRef.current.y, rotationRef.current.z)
            );
            rigidBodyRef.current.setRotation({
                x: quat.x,
                y: quat.y,
                z: quat.z,
                w: quat.w,
            });
        }
    });

    const pos = obstacle.position;
    
    return (
        <RigidBody
            ref={rigidBodyRef}
            type={obstacle.type === 'static' ? 'fixed' : 'kinematicPosition'}
            colliders="cuboid"
        >
            {material && (
                <Box
                    args={[obstacle.size.x, obstacle.size.y, obstacle.size.z]}
                    position={[pos.x, pos.y, pos.z]}
                    rotation={obstacle.rotation ? [obstacle.rotation.x, obstacle.rotation.y, obstacle.rotation.z] : [0, 0, 0]}
                    castShadow
                    receiveShadow
                >
                    <primitive object={material} attach="material" />
                </Box>
            )}
        </RigidBody>
    );
}

// Collectible component - now using EnhancedCollectible, keeping this for distance checking
function Collectible({
    collectible,
    levelId,
    onCollect,
}: {
    collectible: LevelData['collectibles'][0];
    levelId: string;
    onCollect: () => void;
}) {
    const { getLevelProgress } = useLevelManager();
    const position = useGameStore((state) => state.position);
    const progress = getLevelProgress(levelId);
    const collected = progress?.collectiblesFound.includes(collectible.id) || false;
    const collectedRef = useRef(false);

    // Check distance for collection - use useFrame for real-time checking
    useFrame(() => {
        if (collected || collectedRef.current) return;
        
        const pos = new Vector3(
            collectible.position.x,
            collectible.position.y,
            collectible.position.z
        );
        const distance = position.distanceTo(pos);
        
        if (distance < 1.5) {
            collectedRef.current = true;
            console.log('Collectible collected!', collectible.id);
            onCollect();
        }
    });

    // Return invisible collider
    if (collected) return null;
    
    const pos = collectible.position;
    return (
        <RigidBody type="fixed" colliders="ball" position={[pos.x, pos.y, pos.z]}>
            <mesh visible={false}>
                <sphereGeometry args={[0.5, 8, 8]} />
            </mesh>
        </RigidBody>
    );
}

// Checkpoint component
function Checkpoint({
    checkpoint,
    levelId,
    onReach,
}: {
    checkpoint: LevelData['checkpoints'][0];
    levelId: string;
    onReach: () => void;
}) {
    const { getLevelProgress } = useLevelManager();
    const position = useGameStore((state) => state.position);
    const progress = getLevelProgress(levelId);
    const reached = progress?.checkpointsReached.includes(checkpoint.id) || false;
    const reachedRef = useRef(false);
    const pos = new Vector3(
        checkpoint.position.x,
        checkpoint.position.y,
        checkpoint.position.z
    );

    // Check distance for checkpoint - use useFrame for real-time checking
    useFrame(() => {
        if (reached || reachedRef.current) return;
        
        const distance = position.distanceTo(pos);
        if (distance < 2.5) {
            reachedRef.current = true;
            onReach();
        }
    });

    // Return invisible collider
    return (
        <RigidBody type="fixed" colliders="cuboid" position={[pos.x, pos.y + 1, pos.z]}>
            <mesh visible={false}>
                <boxGeometry args={[1, 2, 1]} />
            </mesh>
        </RigidBody>
    );
}

// Goal component
function Goal({ goal }: { goal: LevelData['goal'] }) {
    const pos = goal.position;
    const rotationRef = useRef(0);

    useFrame((state, delta) => {
        rotationRef.current += delta * 2;
    });

    return (
        <group position={[pos.x, pos.y, pos.z]}>
            {/* Main goal box */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[goal.size.x, goal.size.y, goal.size.z]}>
                    <meshStandardMaterial
                        color="#00ffff"
                        emissive="#00ffff"
                        emissiveIntensity={1.0}
                    />
                </Box>
            </RigidBody>
            
            {/* Rotating ring */}
            <mesh rotation={[0, rotationRef.current, 0]} position={[0, goal.size.y / 2 + 1, 0]}>
                <torusGeometry args={[goal.size.x + 1, 0.2, 16, 32]} />
                <meshStandardMaterial
                    color="#ffff00"
                    emissive="#ffff00"
                    emissiveIntensity={1.5}
                />
            </mesh>
            
            {/* Pulsing glow effect */}
            <mesh position={[0, goal.size.y / 2, 0]}>
                <sphereGeometry args={[goal.size.x * 1.5, 32, 32]} />
                <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.2}
                />
            </mesh>
            
            {/* Arrow pointing up */}
            <mesh position={[0, goal.size.y + 2, 0]}>
                <coneGeometry args={[0.5, 2, 8]} />
                <meshStandardMaterial
                    color="#ffff00"
                    emissive="#ffff00"
                    emissiveIntensity={2.0}
                />
            </mesh>
            
            {/* Text label */}
            <Text
                position={[0, goal.size.y + 4, 0]}
                fontSize={1}
                color="#ffff00"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.1}
                outlineColor="#000000"
            >
                GOAL
            </Text>
        </group>
    );
}

