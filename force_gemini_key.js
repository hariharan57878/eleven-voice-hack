const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const apiKey = 'AIzaSyAaOmKs2y2_YHbIKa_l2jYJmFqfp6PJFzY';

try {
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // FORCE Update GEMINI_API_KEY
  if (envContent.includes('GEMINI_API_KEY=')) {
    envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${apiKey}`);
  } else {
    envContent += `\nGEMINI_API_KEY=${apiKey}`;
  }

  // FORCE Update MOCK_GEMINI to false
  if (envContent.includes('MOCK_GEMINI=')) {
    envContent = envContent.replace(/MOCK_GEMINI=.*/g, 'MOCK_GEMINI=false');
  } else {
    envContent += `\nMOCK_GEMINI=false`;
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('Successfully FORCED .env update with new Gemini Key.');

  // Verify
  const newContent = fs.readFileSync(envPath, 'utf8');
  const match = newContent.match(/GEMINI_API_KEY=(.*)/);
  if (match) {
    console.log('Verification Read:', match[1].substring(0, 10) + '...');
  } else {
    console.log('Verification Read: KEY NOT FOUND');
  }

} catch (error) {
  console.error('Error updating .env:', error);
}
