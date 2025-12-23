const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
require('dotenv').config();

async function testSTT() {
  try {
    const audioPath = path.join(__dirname, 'output_audio.mp3');

    if (!fs.existsSync(audioPath)) {
      console.log("No 'output_audio.mp3' found.");
      return;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath));
    formData.append('model_id', 'scribe_v1');
    formData.append('language_code', 'eng'); // Testing this parameter

    console.log('Sending audio for transcription with language_code=eng...');
    const response = await axios.post('https://api.elevenlabs.io/v1/speech-to-text', formData, {
      headers: {
        ...formData.getHeaders(),
        'xi-api-key': process.env.ELEVEN_API_KEY,
      },
    });

    console.log('STT Success:', response.data);
  } catch (error) {
    console.error('STT Error:', error.response ? error.response.data : error.message);
  }
}

testSTT();
