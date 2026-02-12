import { RigidBody } from '@react-three/rapier';
import { Box, Sphere } from '@react-three/drei';

/**
 * Test environment for validating the 6DoF character controller
 * Includes floors, walls, ceilings, and curved surfaces
 */
export function TestEnvironment() {
    return (
        <group>
            {/* Ground floor - standard walking surface */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[50, 0.5, 50]} position={[0, -0.25, 0]}>
                    <meshStandardMaterial color="#2a2a2a" />
                </Box>
            </RigidBody>

            {/* Elevated platform */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[10, 0.5, 10]} position={[15, 3, 0]}>
                    <meshStandardMaterial color="#3a3a3a" />
                </Box>
            </RigidBody>

            {/* Vertical wall for wall-walking */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[0.5, 10, 15]} position={[-10, 5, 0]}>
                    <meshStandardMaterial color="#4a4a4a" />
                </Box>
            </RigidBody>

            {/* Ceiling platform - for inverted gravity testing */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[12, 0.5, 12]} position={[0, 15, -15]}>
                    <meshStandardMaterial color="#5a5a5a" />
                </Box>
            </RigidBody>

            {/* Angled ramp */}
            <RigidBody type="fixed" colliders="cuboid" rotation={[0, 0, Math.PI / 6]}>
                <Box args={[8, 0.5, 8]} position={[0, 2, 15]}>
                    <meshStandardMaterial color="#6a6a6a" />
                </Box>
            </RigidBody>

            {/* Curved surface (sphere) for testing complex normals */}
            <RigidBody type="fixed" colliders="ball">
                <Sphere args={[5, 32, 32]} position={[-15, 5, -15]}>
                    <meshStandardMaterial color="#7a4a7a" wireframe />
                </Sphere>
            </RigidBody>

            {/* Reference grid on floor */}
            <gridHelper args={[50, 50, '#444444', '#222222']} position={[0, 0.01, 0]} />
        </group>
    );
}
