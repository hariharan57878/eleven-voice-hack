const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const elevenKey = 'a6b3364f3684aedef5be19353b995b9926b33d21f02c9001bab0ec61a435ca3b';

try {
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update ElevenLabs Key
  if (envContent.includes('ELEVEN_API_KEY=')) {
    envContent = envContent.replace(/ELEVEN_API_KEY=.*/g, `ELEVEN_API_KEY=${elevenKey}`);
  } else {
    envContent += `\nELEVEN_API_KEY=${elevenKey}`;
  }

  // Update Mock Gemini to TRUE because we don't have a valid Gemini Key yet
  if (envContent.includes('MOCK_GEMINI=')) {
    envContent = envContent.replace(/MOCK_GEMINI=.*/g, 'MOCK_GEMINI=true');
  } else {
    envContent += `\nMOCK_GEMINI=true`;
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('Updated .env with valid ElevenLabs Key and MOCK_GEMINI=true');

} catch (error) {
  console.error('Error:', error);
}
