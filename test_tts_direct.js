const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;

async function testTTS() {
  console.log("Testing ElevenLabs TTS...");
  if (!ELEVEN_API_KEY) {
    console.error("ERROR: ELEVEN_API_KEY is missing from .env");
    return;
  }

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Rachel
      data: {
        text: "Hello, this is a test.",
        model_id: "eleven_turbo_v2_5"
      },
      headers: {
        'xi-api-key': ELEVEN_API_KEY,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    console.log("Success! Audio received. Size:", response.data.length);
    fs.writeFileSync('test_output.mp3', response.data);
    console.log("Saved to test_output.mp3");

  } catch (error) {
    console.error("TTS Failed:", error.response ? error.response.data.toString() : error.message);
  }
}

testTTS();
