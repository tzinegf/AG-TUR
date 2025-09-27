// Custom start script to handle offline mode properly
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting AG TUR development server...');

// Set environment variables
process.env.CI = 'false';
process.env.EXPO_OFFLINE = 'true';
process.env.EXPO_NO_TELEMETRY = '1';

// Start Expo with proper configuration
const expo = spawn('npx', ['expo', 'start', '--offline', '--clear'], {
  cwd: path.resolve(__dirname),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    CI: 'false',
    EXPO_OFFLINE: 'true'
  }
});

expo.on('error', (err) => {
  console.error('Failed to start server:', err);
});

expo.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Server exited with code ${code}`);
  }
});
