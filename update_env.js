const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const keyToAdd = 'GEMINI_API_KEY=AIzaSyAaOmKs2y2_YHbIKa_l2jYJmFqfp6PJFzY';
const mockToAdd = 'MOCK_GEMINI=false';

try {
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    console.log('.env file not found, creating new one.');
  }

  // Update or Add GEMINI_API_KEY
  if (envContent.includes('GEMINI_API_KEY=')) {
    envContent = envContent.replace(/GEMINI_API_KEY=.*/g, keyToAdd);
  } else {
    envContent += `\n${keyToAdd}`;
  }

  // Update or Add MOCK_GEMINI
  if (envContent.includes('MOCK_GEMINI=')) {
    envContent = envContent.replace(/MOCK_GEMINI=.*/g, mockToAdd);
  } else {
    envContent += `\n${mockToAdd}`;
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('Successfully updated .env with Gemini API Key and disabled Mock mode.');

} catch (error) {
  console.error('Error updating .env:', error);
}
