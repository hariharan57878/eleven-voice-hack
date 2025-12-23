const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

const content = `PORT=3000
ELEVEN_API_KEY=sk_114ac7ba6b907f766336423985eb931557088923a109a963
GEMINI_API_KEY=AIzaSyAKSL7OBjXzwhVuZLN0bbCzEsCZntbSmW4
MOCK_GEMINI=false
`;

try {
  fs.writeFileSync(envPath, content);
  console.log('Completely rewrote .env with correct keys.');
} catch (error) {
  console.error('Failed to write .env:', error);
}
