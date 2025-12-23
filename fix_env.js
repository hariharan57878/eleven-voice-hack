const fs = require('fs');
const content = [
  'PORT=3000',
  'ELEVEN_API_KEY=a6b3364f3684aedef5be19353b995b9926b33d21f02c9001bab0ec61a435ca3b',
  'GOOGLE_CLOUD_PROJECT=eleven-voice-hack',
  'MOCK_GEMINI=true'
].join('\n');

fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env file rewritten with UTF-8 encoding');
