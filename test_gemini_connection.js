require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Testing with Key:", apiKey ? apiKey.substring(0, 8) + "..." : "MISSING");

  const genAI = new GoogleGenerativeAI(apiKey);

  // Try usage with the specific model being used in server.js
  // Also try 1.5 flash as fallback
  const modelsToTest = ["gemini-pro", "gemini-1.5-flash"];

  for (const modelName of modelsToTest) {
    console.log(`\n--- Testing Model: ${modelName} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = "Hello, are you working?";
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`SUCCESS [${modelName}]:`, text);
      return; // Exit on first success
    } catch (error) {
      console.error(`FAILED [${modelName}]:`, error.message);
      if (error.response) {
        console.error("Error Details:", JSON.stringify(error.response, null, 2));
      }
    }
  }
}

testGemini(); 