import { useGameStore } from '../store/gameStore';
import './DebugOverlay.css';

/**
 * On-screen debug UI showing character state
 * Uses direct Zustand subscriptions to avoid React re-render overhead
 */
export function DebugOverlay() {
    const position = useGameStore((state) => state.position);
    const velocity = useGameStore((state) => state.velocity);
    const isGrounded = useGameStore((state) => state.isGrounded);
    const isDashing = useGameStore((state) => state.isDashing);
    const surfaceNormal = useGameStore((state) => state.currentSurfaceNormal);

    const velocityMag = velocity.length().toFixed(2);

    return (
        <div className="debug-overlay">
            <h3>Debug Info</h3>
            <div className="debug-line">
                <span className="label">Position:</span>
                <span className="value">
                    {position.x.toFixed(1)}, {position.y.toFixed(1)}, {position.z.toFixed(1)}
                </span>
            </div>
            <div className="debug-line">
                <span className="label">Velocity:</span>
                <span className="value">{velocityMag} m/s</span>
            </div>
            <div className="debug-line">
                <span className="label">Grounded:</span>
                <span className={`value ${isGrounded ? 'active' : ''}`}>
                    {isGrounded ? 'YES (Magnetic)' : 'NO (Free)'}
                </span>
            </div>
            <div className="debug-line">
                <span className="label">Dashing:</span>
                <span className={`value ${isDashing ? 'active' : ''}`}>
                    {isDashing ? 'YES' : 'NO'}
                </span>
            </div>
            {surfaceNormal && (
                <div className="debug-line">
                    <span className="label">Surface Normal:</span>
                    <span className="value">
                        {surfaceNormal.x.toFixed(2)}, {surfaceNormal.y.toFixed(2)}, {surfaceNormal.z.toFixed(2)}
                    </span>
                </div>
            )}
            <div className="debug-controls">
                <p><strong>Controls:</strong></p>
                <p>WASD - Move | Space - Jump | Shift - Dash</p>
                <p>Mouse - Look | Click - Lock Pointer</p>
            </div>
        </div>
    );
}
