/**
 * Asset Setup Script
 * Downloads example free textures for testing
 * Run with: node scripts/setup-assets.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create directories
const dirs = [
    'public/assets/textures/platform',
    'public/assets/textures/ground',
    'public/assets/textures/obstacle',
    'public/assets/models',
    'public/assets/environment'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created: ${dir}`);
    }
});

console.log('\n✓ Asset directories created!');
console.log('\nTo add professional assets:');
console.log('1. Visit https://polyhaven.com/textures');
console.log('2. Download texture sets (concrete, metal, etc.)');
console.log('3. Extract and rename files:');
console.log('   - diffuse.jpg -> albedo.jpg');
console.log('   - normal.jpg -> normal.jpg');
console.log('   - roughness.jpg -> roughness.jpg');
console.log('   - metalness.jpg -> metallic.jpg');
console.log('   - ao.jpg -> ao.jpg');
console.log('4. Place in public/assets/textures/[category]/');
console.log('5. Update src/config/assets.ts with paths');
console.log('\nRecommended free sources:');
console.log('- Poly Haven: https://polyhaven.com/textures (CC0)');
console.log('- Quaternius: https://quaternius.com/ (CC0 models)');
console.log('- Kenney.nl: https://kenney.nl/assets (CC0)');

