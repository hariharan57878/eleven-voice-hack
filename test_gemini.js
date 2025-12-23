const axios = require('axios');

async function testGemini() {
  try {
    const response = await axios.post('http://localhost:3000/api/generate', {
      prompt: 'Tell me a short joke about coding.'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testGemini();
