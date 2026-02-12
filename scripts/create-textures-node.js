#!/usr/bin/env node

/**
 * Node.js script to generate high-quality procedural textures
 * This creates professional-looking textures programmatically
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Check if canvas is available
let Canvas;
try {
    Canvas = require('canvas');
} catch (e) {
    console.error('❌ Canvas module not found. Install it with: npm install canvas');
    console.log('📝 Note: Procedural textures will be generated in the browser instead.');
    process.exit(0);
}

const BASE_DIR = path.join(__dirname, '../public/assets/textures');
const sizes = {
    ground: 2048,
    platform: 2048,
    obstacle: 1024,
};

function createConcreteTexture(size) {
    const canvas = Canvas.createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Base color
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(0, 0, size, size);
    
    // Add noise
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 50;
        const base = 90;
        const value = Math.max(0, Math.min(255, base + noise));
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    
    // Add texture details
    ctx.strokeStyle = 'rgba(40, 40, 40, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * size, Math.random() * size);
        ctx.lineTo(Math.random() * size, Math.random() * size);
        ctx.stroke();
    }
    
    // Add aggregate
    ctx.fillStyle = 'rgba(70, 70, 70, 0.5)';
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 5 + 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    return canvas;
}

function createMetalTexture(size) {
    const canvas = Canvas.createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Gradient base
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6a6a6a');
    gradient.addColorStop(0.5, '#3a3a3a');
    gradient.addColorStop(1, '#6a6a6a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Brushed metal
    for (let i = 0; i < size; i += 2) {
        const alpha = 0.1 + Math.random() * 0.2;
        ctx.strokeStyle = `rgba(120, 120, 120, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
    }
    
    // Rust spots
    ctx.fillStyle = 'rgba(100, 50, 30, 0.3)';
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 12 + 5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    return canvas;
}

// Create directories
['ground', 'platform', 'obstacle'].forEach(dir => {
    const dirPath = path.join(BASE_DIR, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Generate textures
console.log('🎨 Generating professional procedural textures...');

// Ground texture
const groundCanvas = createConcreteTexture(sizes.ground);
const groundBuffer = groundCanvas.toBuffer('image/jpeg', { quality: 0.9 });
fs.writeFileSync(path.join(BASE_DIR, 'ground/albedo.jpg'), groundBuffer);
console.log('✅ Created ground/albedo.jpg');

// Platform texture
const platformCanvas = createConcreteTexture(sizes.platform);
const platformBuffer = platformCanvas.toBuffer('image/jpeg', { quality: 0.9 });
fs.writeFileSync(path.join(BASE_DIR, 'platform/albedo.jpg'), platformBuffer);
console.log('✅ Created platform/albedo.jpg');

// Obstacle texture
const obstacleCanvas = createMetalTexture(sizes.obstacle);
const obstacleBuffer = obstacleCanvas.toBuffer('image/jpeg', { quality: 0.9 });
fs.writeFileSync(path.join(BASE_DIR, 'obstacle/albedo.jpg'), obstacleBuffer);
console.log('✅ Created obstacle/albedo.jpg');

console.log('');
console.log('✨ All textures generated successfully!');
console.log(`📁 Location: ${BASE_DIR}`);

