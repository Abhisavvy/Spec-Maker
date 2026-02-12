import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, useRapier } from '@react-three/rapier';
import { Vector3, Quaternion, Euler } from 'three';
import { useKeyboardControls } from '@react-three/drei';
import { PHYSICS_CONFIG, CAMERA_CONFIG } from '../utils/constants';
import { useGameStore } from '../store/gameStore';
import { useReplaySystem } from '../systems/ReplaySystem';

/**
 * Mirror's Edge Style Character Controller
 * 
 * Smooth, responsive movement with:
 * - Standard FPS movement (WASD)
 * - Wall-running with momentum
 * - Slide mechanics
 * - Dash (ground and air)
 * - Double jump
 * - Standard gravity
 */

interface CharacterControllerProps {
    onCameraUpdate?: (position: Vector3, rotation: Quaternion) => void;
}

interface WallHit {
    normal: Vector3;
    point: Vector3;
    distance: number;
}

export function CharacterController({ onCameraUpdate }: CharacterControllerProps) {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const { rapier, world } = useRapier();

    // Movement state
    const [isWallRunning, setIsWallRunning] = useState(false);
    const [isSliding, setIsSliding] = useState(false);
    const [isDashing, setIsDashing] = useState(false);
    const [wallNormal, setWallNormal] = useState<Vector3 | null>(null);

    // Jump state
    const [jumpCount, setJumpCount] = useState(0);
    const [canDoubleJump, setCanDoubleJump] = useState(false);
    const [canAirDash, setCanAirDash] = useState(true);
    const lastJumpTime = useRef<number>(0);
    const lastGroundedTime = useRef<number>(0);
    const jumpBufferTime = useRef<number>(0);

    // Slide/Dash cooldowns
    const lastSlideTime = useRef<number>(0);
    const lastDashTime = useRef<number>(0);
    const slideTimeoutRef = useRef<number | null>(null);

    // Camera rotation (Euler angles for smooth interpolation)
    const euler = useRef(new Euler(0, 0, 0, 'YXZ'));
    const pitch = useRef(0);
    const yaw = useRef(0);

    // Smooth movement interpolation
    const currentVelocity = useRef(new Vector3(0, 0, 0));
    const targetVelocity = useRef(new Vector3(0, 0, 0));

    // Store updates
    const setStorePosition = useGameStore((state) => state.setPosition);
    const setStoreVelocity = useGameStore((state) => state.setVelocity);
    const setStoreGrounded = useGameStore((state) => state.setGrounded);
    const setStoreDashing = useGameStore((state) => state.setDashing);
    const setStoreWallRunning = useGameStore((state) => state.setWallRunning);
    const setStoreSliding = useGameStore((state) => state.setSliding);
    const { recordFrame } = useReplaySystem();

    // Keyboard input
    const [, getKeys] = useKeyboardControls();

    // Mouse look handler - smooth and responsive
    useEffect(() => {
        let isPointerLocked = false;

        const handleMouseMove = (e: MouseEvent) => {
            if (isPointerLocked) {
                // Smooth mouse sensitivity
                const sensitivity = CAMERA_CONFIG.MOUSE_SENSITIVITY;
                yaw.current -= e.movementX * sensitivity;
                pitch.current -= e.movementY * sensitivity;

                // Clamp pitch
                pitch.current = Math.max(
                    -CAMERA_CONFIG.MAX_PITCH,
                    Math.min(CAMERA_CONFIG.MAX_PITCH, pitch.current)
                );

                // Update euler for camera
                euler.current.set(pitch.current, yaw.current, 0);
            }
        };

        const handlePointerLockChange = () => {
            isPointerLocked = document.pointerLockElement !== null;
        };

        const handleClick = () => {
            if (document.pointerLockElement === null) {
                document.body.requestPointerLock();
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('pointerlockchange', handlePointerLockChange);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
            document.removeEventListener('click', handleClick);
        };
    }, []);

    // Ground detection using raycast
    const checkGround = (pos: Vector3, world: any): boolean => {
        const rayOrigin = { x: pos.x, y: pos.y + 0.1, z: pos.z };
        const rayDir = { x: 0, y: -1, z: 0 };
        const ray = new rapier.Ray(rayOrigin, rayDir);
        const hit = world.castRay(ray, PHYSICS_CONFIG.GROUND_RAY_DISTANCE, true);
        
        if (hit) {
            const distance = hit.timeOfImpact;
            return distance < PHYSICS_CONFIG.GROUND_CHECK_DISTANCE + 0.1;
        }
        return false;
    };

    // Wall detection for wall-running
    const checkWalls = (pos: Vector3, vel: Vector3, world: any): WallHit | null => {
        if (vel.length() < PHYSICS_CONFIG.WALL_MIN_SPEED) return null;

        // Check walls relative to movement direction
        const right = new Vector3(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), yaw.current);
        const forward = new Vector3(0, 0, -1).applyAxisAngle(new Vector3(0, 1, 0), yaw.current);

        // Check right and left walls
        const checkDirs = [
            { dir: right, side: 'right' as const },
            { dir: right.clone().negate(), side: 'left' as const },
            { dir: forward, side: 'right' as const },
            { dir: forward.clone().negate(), side: 'left' as const },
        ];

        for (const { dir } of checkDirs) {
            const rayOrigin = { x: pos.x, y: pos.y + 0.5, z: pos.z };
            const rayDir = { x: dir.x, y: dir.y, z: dir.z };
            const ray = new rapier.Ray(rayOrigin, rayDir);
            const hit = world.castRay(ray, PHYSICS_CONFIG.WALL_DETECTION_DISTANCE, true);

            if (hit) {
                const normal = hit.normal;
                const normalVec = new Vector3(normal.x, normal.y, normal.z);
                
                // Check if wall is vertical enough (not floor/ceiling)
                const upDot = Math.abs(normalVec.y);
                if (upDot < PHYSICS_CONFIG.WALL_ANGLE_THRESHOLD) {
                    const point = ray.pointAt(hit.timeOfImpact);
                    return {
                        normal: normalVec,
                        point: new Vector3(point.x, point.y, point.z),
                        distance: hit.timeOfImpact,
                    };
                }
            }
        }

        return null;
    };

    // Main physics loop - smooth and frame-independent
    useFrame((state, delta) => {
        if (!rigidBodyRef.current) return;

        const rb = rigidBodyRef.current;
        const keys = getKeys();

        // Get current state
        const position = rb.translation();
        const velocity = rb.linvel();
        const pos = new Vector3(position.x, position.y, position.z);
        const vel = new Vector3(velocity.x, velocity.y, velocity.z);
        const currentTime = state.clock.elapsedTime;

        // ===== GROUND DETECTION =====
        const grounded = checkGround(pos, world);
        setStoreGrounded(grounded);

        if (grounded) {
            lastGroundedTime.current = currentTime;
            setJumpCount(0);
            setCanDoubleJump(true);
            setCanAirDash(true);
            setIsWallRunning(false);
            setWallNormal(null);
            rb.setGravityScale(1.0, true);
        }

        // ===== WALL DETECTION =====
        let wallHit: WallHit | null = null;
        if (!grounded && !isSliding) {
            wallHit = checkWalls(pos, vel, world);
        }

        // ===== WALL-RUNNING =====
        if (wallHit && !grounded && !isSliding) {
            const wallDot = wallHit.normal.dot(new Vector3(0, 1, 0));
            if (Math.abs(wallDot) < PHYSICS_CONFIG.WALL_ANGLE_THRESHOLD && vel.length() > PHYSICS_CONFIG.WALL_MIN_SPEED) {
                if (!isWallRunning) {
                    setIsWallRunning(true);
                    setStoreWallRunning(true);
                    setWallNormal(wallHit.normal);
                }

                // Reduce gravity while wall-running
                rb.setGravityScale(PHYSICS_CONFIG.WALL_RUN_GRAVITY_SCALE, true);
                
                // Push away from wall slightly
                const pushForce = wallHit.normal.clone().multiplyScalar(2);
                rb.addForce({ x: pushForce.x, y: pushForce.y, z: pushForce.z }, true);

                // Maintain forward momentum along wall
                const forward = new Vector3(0, 0, -1).applyAxisAngle(new Vector3(0, 1, 0), yaw.current);
                const wallForward = forward.clone().sub(wallHit.normal.clone().multiplyScalar(forward.dot(wallHit.normal)));
                wallForward.normalize();
                
                const targetSpeed = PHYSICS_CONFIG.WALL_RUN_SPEED;
                const currentSpeed = vel.length();
                if (currentSpeed < targetSpeed) {
                    const boost = wallForward.multiplyScalar((targetSpeed - currentSpeed) * 10);
                    rb.addForce({ x: boost.x, y: boost.y, z: boost.z }, true);
                }
            } else {
                if (isWallRunning) {
                    setIsWallRunning(false);
                    setStoreWallRunning(false);
                    setWallNormal(null);
                    rb.setGravityScale(1.0, true);
                }
            }
        } else {
            if (isWallRunning) {
                setIsWallRunning(false);
                setStoreWallRunning(false);
                setWallNormal(null);
                rb.setGravityScale(1.0, true);
            }
        }

        // ===== MOVEMENT INPUT =====
        // Calculate movement direction based on camera yaw
        const forward = new Vector3(0, 0, -1).applyAxisAngle(new Vector3(0, 1, 0), yaw.current);
        const right = new Vector3(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), yaw.current);

        const moveDirection = new Vector3();
        if (keys.forward) moveDirection.add(forward);
        if (keys.backward) moveDirection.sub(forward);
        if (keys.left) moveDirection.sub(right);
        if (keys.right) moveDirection.add(right);

        // ===== SLIDE =====
        if (keys.dash && grounded && !isSliding && currentTime - lastSlideTime.current > PHYSICS_CONFIG.SLIDE_COOLDOWN) {
            const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
            if (speed > PHYSICS_CONFIG.SLIDE_MIN_SPEED) {
                setIsSliding(true);
                setStoreSliding(true);
                lastSlideTime.current = currentTime;
                
                if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
                slideTimeoutRef.current = setTimeout(() => {
                    setIsSliding(false);
                    setStoreSliding(false);
                }, PHYSICS_CONFIG.SLIDE_DURATION * 1000);
            }
        }

        // ===== SMOOTH MOVEMENT =====
        // Use velocity-based movement for smooth, responsive controls
        if (moveDirection.length() > 0 && !isSliding) {
            moveDirection.normalize();
            
            const isRunning = keys.forward && !keys.backward;
            const targetSpeed = isRunning ? PHYSICS_CONFIG.RUN_SPEED : PHYSICS_CONFIG.MOVEMENT_SPEED;
            const control = grounded ? 1.0 : PHYSICS_CONFIG.AIR_CONTROL;
            
            // Calculate desired velocity
            targetVelocity.current.copy(moveDirection).multiplyScalar(targetSpeed);
            
            // Smooth interpolation towards target velocity
            const currentHorizVel = new Vector3(vel.x, 0, vel.z);
            const acceleration = grounded ? PHYSICS_CONFIG.ACCELERATION : PHYSICS_CONFIG.AIR_ACCELERATION;
            const lerpFactor = Math.min(1, acceleration * delta * control);
            
            currentVelocity.current.lerp(targetVelocity.current, lerpFactor);
            
            // Apply velocity change
            const velChange = currentVelocity.current.clone().sub(currentHorizVel);
            rb.setLinvel({
                x: vel.x + velChange.x * delta,
                y: vel.y,
                z: vel.z + velChange.z * delta
            }, true);
        } else if (grounded && !isSliding) {
            // Smooth deceleration
            const currentHorizVel = new Vector3(vel.x, 0, vel.z);
            const decelFactor = Math.min(1, PHYSICS_CONFIG.DECELERATION * delta);
            const newVel = currentHorizVel.multiplyScalar(1 - decelFactor);
            
            rb.setLinvel({
                x: newVel.x,
                y: vel.y,
                z: newVel.z
            }, true);
        }

        // Slide movement (maintains momentum)
        if (isSliding) {
            const slideDir = new Vector3(vel.x, 0, vel.z).normalize();
            if (slideDir.length() > 0.1) {
                const slideSpeed = Math.max(
                    Math.sqrt(vel.x * vel.x + vel.z * vel.z),
                    PHYSICS_CONFIG.SLIDE_SPEED
                );
                const slideVel = slideDir.multiplyScalar(slideSpeed);
                rb.setLinvel({ x: slideVel.x, y: vel.y, z: slideVel.z }, true);
            }
        }

        // ===== JUMP =====
        const timeSinceGrounded = currentTime - lastGroundedTime.current;
        const canCoyoteJump = timeSinceGrounded < PHYSICS_CONFIG.COYOTE_TIME;
        
        if (keys.jump) {
            jumpBufferTime.current = currentTime;
        }

        const jumpBuffered = currentTime - jumpBufferTime.current < PHYSICS_CONFIG.JUMP_BUFFER;

        if (jumpBuffered) {
            if (grounded || canCoyoteJump) {
                // Ground jump
                if (currentTime - lastJumpTime.current > 0.2) {
                    rb.setLinvel({ x: vel.x, y: PHYSICS_CONFIG.JUMP_FORCE, z: vel.z }, true);
                    setJumpCount(1);
                    lastJumpTime.current = currentTime;
                    jumpBufferTime.current = 0;
                }
            } else if (isWallRunning && wallNormal) {
                // Wall-run jump
                if (currentTime - lastJumpTime.current > 0.2) {
                    const jumpDir = wallNormal.clone().multiplyScalar(0.5).add(new Vector3(0, 1, 0));
                    jumpDir.normalize();
                    const jumpForce = jumpDir.multiplyScalar(PHYSICS_CONFIG.WALL_RUN_JUMP_FORCE);
                    rb.setLinvel({ 
                        x: vel.x + jumpForce.x, 
                        y: jumpForce.y, 
                        z: vel.z + jumpForce.z 
                    }, true);
                    setIsWallRunning(false);
                    setStoreWallRunning(false);
                    setWallNormal(null);
                    setCanDoubleJump(true);
                    lastJumpTime.current = currentTime;
                    jumpBufferTime.current = 0;
                }
            } else if (canDoubleJump && jumpCount === 1) {
                // Double jump
                if (currentTime - lastJumpTime.current > 0.2) {
                    rb.setLinvel({ x: vel.x, y: PHYSICS_CONFIG.DOUBLE_JUMP_FORCE, z: vel.z }, true);
                    setJumpCount(2);
                    setCanDoubleJump(false);
                    lastJumpTime.current = currentTime;
                    jumpBufferTime.current = 0;
                }
            }
        }

        // ===== DASH =====
        if (keys.dash && !isSliding && currentTime - lastDashTime.current > PHYSICS_CONFIG.DASH_COOLDOWN) {
            if (grounded || canAirDash) {
                setIsDashing(true);
                setStoreDashing(true);
                lastDashTime.current = currentTime;

                const dashDir = forward.clone().normalize();
                const dashForce = grounded ? PHYSICS_CONFIG.DASH_FORCE : PHYSICS_CONFIG.AIR_DASH_FORCE;
                const dashImpulse = dashDir.multiplyScalar(dashForce);
                
                rb.applyImpulse({ x: dashImpulse.x, y: 0, z: dashImpulse.z }, true);

                if (!grounded) {
                    setCanAirDash(false);
                }

                setTimeout(() => {
                    setIsDashing(false);
                    setStoreDashing(false);
                }, PHYSICS_CONFIG.DASH_DURATION * 1000);
            }
        }

        // ===== FRICTION =====
        let friction: number;
        if (isSliding) {
            friction = PHYSICS_CONFIG.SLIDE_FRICTION;
        } else if (isWallRunning) {
            friction = PHYSICS_CONFIG.WALL_RUN_FRICTION;
        } else if (grounded) {
            friction = PHYSICS_CONFIG.GROUND_FRICTION;
        } else {
            friction = PHYSICS_CONFIG.AIR_FRICTION;
        }
        rb.setLinearDamping(friction);

        // Update store
        setStorePosition(pos);
        setStoreVelocity(vel);
        const horizontalSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
        useGameStore.getState().setSpeed(horizontalSpeed);

        // Update camera directly for smooth movement
        if (onCameraUpdate) {
            const cameraQuat = new Quaternion().setFromEuler(euler.current);
            onCameraUpdate(pos, cameraQuat);
            recordFrame(pos, cameraQuat);
        }
    });

    // Determine character color based on state
    const getCharacterColor = () => {
        if (isWallRunning) return "#00ffff";
        if (isSliding) return "#ffff00";
        if (isDashing) return "#ff00ff";
        return "#00ff88";
    };

    const getEmissiveColor = () => {
        if (isWallRunning) return "#00ffff";
        if (isSliding) return "#ffff00";
        if (isDashing) return "#ff00ff";
        return "#00ff88";
    };

    return (
        <RigidBody
            ref={rigidBodyRef}
            type="dynamic"
            position={[0, 5, 0]}
            enabledRotations={[false, false, false]}
            gravityScale={1.0}
            linearDamping={PHYSICS_CONFIG.GROUND_FRICTION}
            mass={1} // Standard game mass (gravity is independent of mass)
        >
            {/* Enhanced visual representation */}
            <mesh castShadow scale={isSliding ? [1, 0.5, 1] : [1, 1, 1]}>
                <capsuleGeometry args={[0.4, isSliding ? PHYSICS_CONFIG.SLIDE_HEIGHT : PHYSICS_CONFIG.NORMAL_HEIGHT, 8, 16]} />
                <meshStandardMaterial 
                    color={getCharacterColor()}
                    emissive={getEmissiveColor()}
                    emissiveIntensity={0.4}
                    metalness={0.3}
                    roughness={0.4}
                />
            </mesh>
            
            {/* Glow effect */}
            <mesh scale={isSliding ? [1.2, 0.6, 1.2] : [1.2, 1.2, 1.2]}>
                <capsuleGeometry args={[0.5, isSliding ? PHYSICS_CONFIG.SLIDE_HEIGHT : PHYSICS_CONFIG.NORMAL_HEIGHT, 8, 16]} />
                <meshStandardMaterial 
                    color={getEmissiveColor()}
                    emissive={getEmissiveColor()}
                    emissiveIntensity={0.2}
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </RigidBody>
    );
}

// Define keyboard controls map
export const keyboardControlsMap = [
    { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
    { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
    { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
    { name: 'right', keys: ['KeyD', 'ArrowRight'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'dash', keys: ['ShiftLeft', 'ShiftRight'] },
];
