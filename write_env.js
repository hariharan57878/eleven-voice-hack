const fs = require('fs');
const content = `PORT=3000
ELEVEN_API_KEY=sk_293c992e4c9d8ab666fc2a3fc4b20af0f63bd12a803a99c3
GOOGLE_CLOUD_PROJECT=eleven-voice-hack
`;
fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env file written successfully');
