const axios = require('axios');
const fs = require('fs');

async function testTTS() {
  try {
    console.log('Requesting TTS...');
    const response = await axios.post('http://localhost:3000/api/tts', {
      text: 'Hello! This is a test of the ElevenLabs Text to Speech API.'
    }, {
      responseType: 'arraybuffer' // Important for audio data
    });

    if (response.data) {
      // The server saves the file, but we can also save it here if we want to verify
      console.log('TTS Success! Audio received.');
      // We rely on the server saving 'output_audio.mp3' for the STT test
    }
  } catch (error) {
    console.error('TTS Error:', error.response ? error.response.data.toString() : error.message);
  }
}

testTTS();
