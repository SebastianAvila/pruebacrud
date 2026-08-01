const fs = require('fs');
const path = require('path');

// Backend directory path
const BACKEND_DIR = path.join(__dirname, 'backend');

console.log('Current working directory:', process.cwd());
console.log('Backend directory path:', BACKEND_DIR);

// List files in backend directory
try {
  const files = fs.readdirSync(BACKEND_DIR);
  console.log('Files in backend directory:', files);
} catch (err) {
  console.log('Error reading backend directory:', err.message);
}

// Check if server.js exists
const serverPath = path.join(BACKEND_DIR, 'server.js');
console.log('server.js exists:', fs.existsSync(serverPath));

// Try to require server.js
try {
  const server = require(serverPath);
  console.log('server.js loaded successfully');
} catch (err) {
  console.log('Error loading server.js:', err.message);
}

// Check if seed.js exists
const seedPath = path.join(BACKEND_DIR, 'seed.js');
console.log('seed.js exists:', fs.existsSync(seedPath));

// Try to run seed.js directly
const spawn = require('child_process').spawn;
try {
  console.log('\nRunning seed.js...');
  const seedProcess = spawn('node', [seedPath], {
    cwd: BACKEND_DIR,
    stdio: 'inherit'
  });
  
  seedProcess.on('close', (code) => {
    console.log(`Seed script finished with code: ${code}`);
  });
} catch (err) {
  console.log('Error running seed.js:', err.message);
}
