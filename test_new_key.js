const axios = require('axios');

async function testNewKey() {
  const NEW_KEY = 'a6b3364f3684aedef5be19353b995b9926b33d21f02c9001bab0ec61a435ca3b';
  console.log(`Testing key: ${NEW_KEY.substring(0, 6)}...`);

  try {
    // Try a simple GET request to User Info endpoint
    const response = await axios.get('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': NEW_KEY }
    });
    console.log('Key is VALID! User:', response.data.subscription.tier);
  } catch (error) {
    console.error('Key is INVALID for ElevenLabs:', error.response ? error.response.status : error.message);
  }
}

testNewKey();
