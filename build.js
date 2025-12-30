const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- STARTING BUILD SCRIPT ---');

try {
  // 1. Install Frontend Dependencies
  console.log('1. Installing frontend dependencies...');
  execSync('npm install --prefix frontend', { stdio: 'inherit' });

  // 2. Build Frontend
  console.log('2. Building frontend...');
  execSync('npm run build --prefix frontend', { stdio: 'inherit' });

  // 3. Move 'frontend/dist' to 'dist' (Root)
  const src = path.join(__dirname, 'frontend', 'dist');
  const dest = path.join(__dirname, 'dist');

  console.log(`3. Copying build artifacts from ${src} to ${dest}...`);

  if (fs.existsSync(dest)) {
    console.log('   Cleaning existing dist...');
    fs.rmSync(dest, { recursive: true, force: true });
  }

  // Ensure recursive copy
  fs.cpSync(src, dest, { recursive: true });

  console.log('--- BUILD SUCCESSFUL: Artifacts ready in ./dist ---');

} catch (error) {
  console.error('!!! BUILD FAILED !!!');
  console.error(error);
  process.exit(1);
}
