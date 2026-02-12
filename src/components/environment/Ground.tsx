import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Box } from '@react-three/drei';
import { AssetLoader } from '../../utils/assetLoader';

interface GroundProps {
    size?: number;
    position?: [number, number, number];
}

export function Ground({ size = 50, position = [0, -0.25, 0] }: GroundProps) {
    const material = useMemo(() => AssetLoader.createGroundMaterial(), []);

    return (
        <RigidBody type="fixed" colliders="cuboid">
            <Box 
                args={[size, 0.5, size]} 
                position={position}
                receiveShadow
            >
                <primitive object={material} attach="material" />
            </Box>
        </RigidBody>
    );
}
