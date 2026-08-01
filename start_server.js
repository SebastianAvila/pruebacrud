const fs = require('fs');

// Check if we're in the right directory
console.log('Current directory:', process.cwd());

// Check if server.js exists
if (fs.existsSync('backend/server.js')) {
  console.log('backend/server.js exists');
  
  // Check package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  console.log('Available scripts:', Object.keys(packageJson.scripts || {}));
  
  // Try to start server with node directly
  try {
    console.log('Starting server with node directly...');
    const { spawn } = require('child_process');
    const serverProcess = spawn('node', ['backend/server.js'], {
      stdio: 'pipe',
      detached: false
    });
    
    serverProcess.stdout.on('data', (data) => {
      console.log('Server stdout:', data.toString());
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error('Server stderr:', data.toString());
    });
    
    serverProcess.on('close', (code) => {
      console.log('Server process exited with code:', code);
    });
    
    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
    });
    
  } catch (err) {
    console.error('Error starting server:', err);
  }
} else {
  console.log('backend/server.js does not exist');
  console.log('Available files in current directory:', fs.readdirSync('.'));
}
