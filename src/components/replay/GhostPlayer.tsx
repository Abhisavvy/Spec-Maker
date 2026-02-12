import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Vector3, Quaternion } from 'three';
import { useReplaySystem } from '../../systems/ReplaySystem';

interface GhostPlayerProps {
    levelId: string;
    enabled?: boolean;
}

export function GhostPlayer({ levelId, enabled = true }: GhostPlayerProps) {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const { loadBestReplay } = useReplaySystem();
    const replay = enabled ? loadBestReplay(levelId) : null;
    const frameIndexRef = useRef(0);

    useFrame((state, delta) => {
        if (!replay || !rigidBodyRef.current || !enabled) return;

        const currentTime = state.clock.elapsedTime * 1000; // Convert to ms
        const targetTime = currentTime % replay.totalTime;

        // Find the frame at the target time
        let frameIndex = 0;
        for (let i = 0; i < replay.frames.length - 1; i++) {
            if (replay.frames[i].timestamp <= targetTime && replay.frames[i + 1].timestamp >= targetTime) {
                frameIndex = i;
                break;
            }
        }

        if (replay.frames[frameIndex]) {
            const frame = replay.frames[frameIndex];
            const pos = new Vector3(frame.position.x, frame.position.y, frame.position.z);
            const rot = new Quaternion(frame.rotation.x, frame.rotation.y, frame.rotation.z, frame.rotation.w);
            
            rigidBodyRef.current.setTranslation({
                x: pos.x,
                y: pos.y,
                z: pos.z,
            });
            rigidBodyRef.current.setRotation({
                x: rot.x,
                y: rot.y,
                z: rot.z,
                w: rot.w,
            });
        }
    });

    if (!replay || !enabled) return null;

    return (
        <RigidBody
            ref={rigidBodyRef}
            type="kinematicPosition"
            enabledRotations={[false, false, false]}
            colliders="ball"
        >
            <mesh>
                <capsuleGeometry args={[0.5, 1, 8, 16]} />
                <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.5}
                />
            </mesh>
        </RigidBody>
    );
}

