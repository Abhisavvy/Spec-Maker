import { useFrame } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { useState } from 'react';

interface PerformanceMonitorProps {
    show?: boolean;
}

export function PerformanceMonitor({ show = false }: PerformanceMonitorProps) {
    const [fps, setFps] = useState(60);
    const [frameTime, setFrameTime] = useState(16.67);

    useFrame((state, delta) => {
        const currentFps = 1 / delta;
        const currentFrameTime = delta * 1000;
        setFps(Math.round(currentFps));
        setFrameTime(currentFrameTime.toFixed(2));
    });

    if (!show) return null;

    return (
        <>
            <Stats />
            <div
                style={{
                    position: 'fixed',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#00ff88',
                    padding: '10px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    zIndex: 1000,
                    pointerEvents: 'none',
                }}
            >
                <div>FPS: {fps}</div>
                <div>Frame Time: {frameTime}ms</div>
            </div>
        </>
    );
}

