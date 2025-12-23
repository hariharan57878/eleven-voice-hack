require('dotenv').config();
const { VertexAI } = require('@google-cloud/vertexai');

async function checkGemini() {
  console.log("Checking Gemini Connection...");
  console.log("Project:", process.env.GOOGLE_CLOUD_PROJECT);

  try {
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT || 'eleven-voice-hack',
      location: 'us-central1'
    });
    const model = vertexAI.getGenerativeModel({ model: 'gemini-pro' });

    console.log("Attempting generation...");
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: "Hello" }] }],
    });
    const response = await result.response;
    console.log("Success! Response:", response.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Gemini Connection Failed:");
    console.error(error.message);
  }
}

checkGemini();
