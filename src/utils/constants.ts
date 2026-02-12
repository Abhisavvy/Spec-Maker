// Physics and gameplay constants - Mirror's Edge style
export const PHYSICS_CONFIG = {
  // Standard gravity
  GRAVITY: -9.81,
  
  // Character controller - fast paced movement
  MOVEMENT_SPEED: 12,
  RUN_SPEED: 18,
  AIR_CONTROL: 0.3, // How much control in air (0-1)
  ACCELERATION: 50, // Ground acceleration
  AIR_ACCELERATION: 20, // Air acceleration
  DECELERATION: 40, // Ground deceleration
  
  // Jump mechanics - realistic Earth physics
  // For 1.2m jump height: v = sqrt(2gh) = sqrt(2*9.81*1.2) ≈ 4.85 m/s
  JUMP_FORCE: 4.5, // Realistic jump velocity for ~1 meter height
  DOUBLE_JUMP_FORCE: 3.5, // Slightly less for double jump
  COYOTE_TIME: 0.15, // Time after leaving ground where jump still works
  JUMP_BUFFER: 0.1, // Time before landing where jump input is buffered
  
  // Wall-running (Mirror's Edge style)
  WALL_RUN_SPEED: 16,
  WALL_RUN_DURATION: 2.0, // seconds
  WALL_RUN_GRAVITY_SCALE: 0.3, // Reduced gravity while wall-running
  WALL_RUN_JUMP_FORCE: 5.5, // Slightly higher than normal jump for wall-run boost
  WALL_DETECTION_DISTANCE: 0.6,
  WALL_MIN_SPEED: 5, // Minimum speed to maintain wall-run
  WALL_ANGLE_THRESHOLD: 0.7, // Max angle from vertical (0.7 = ~45 degrees)
  
  // Slide mechanics
  SLIDE_SPEED: 20,
  SLIDE_DURATION: 0.6, // seconds
  SLIDE_COOLDOWN: 0.3, // seconds
  SLIDE_MIN_SPEED: 8, // Minimum speed to slide
  SLIDE_HEIGHT: 0.5, // Capsule height during slide
  NORMAL_HEIGHT: 1.0, // Normal capsule height
  
  // Dash mechanics
  DASH_FORCE: 25,
  DASH_DURATION: 0.2, // seconds
  DASH_COOLDOWN: 0.5, // seconds
  AIR_DASH_FORCE: 20,
  
  // Friction and damping
  GROUND_FRICTION: 0.85,
  AIR_FRICTION: 0.05, // Slightly increased for more realistic air resistance
  WALL_RUN_FRICTION: 0.1,
  SLIDE_FRICTION: 0.3,
  
  // Ground detection
  GROUND_CHECK_DISTANCE: 0.1,
  GROUND_RAY_DISTANCE: 0.5,
} as const;

export const CAMERA_CONFIG = {
  FOV: 90,
  DASH_FOV: 100,
  MOUSE_SENSITIVITY: 0.003, // Smooth, responsive mouse sensitivity
  MAX_PITCH: Math.PI / 2 - 0.1,
  WALL_RUN_TILT: 0.2, // Camera tilt during wall-run
  SMOOTH_FACTOR: 0.3, // Camera interpolation smoothness
} as const;

export const DEBUG_CONFIG = {
  SHOW_RAYCAST: false,
  SHOW_NORMALS: false,
  SHOW_VELOCITY: false,
} as const;
