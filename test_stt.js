const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testSTT() {
  try {
    // Ensure you have a sample audio file named 'sample_audio.mp3' in the same directory
    // or change the path below.
    const audioPath = path.join(__dirname, 'output_audio.mp3');

    if (!fs.existsSync(audioPath)) {
      console.log("No 'output_audio.mp3' found. Please run the TTS test first or provide a sample file.");
      return;
    }

    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioPath));

    console.log('Sending audio for transcription...');
    const response = await axios.post('http://localhost:3000/api/stt', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log('STT Success:', response.data);
  } catch (error) {
    console.error('STT Error:', error.response ? error.response.data : error.message);
  }
}

testSTT();
