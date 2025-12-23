const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
  const key = 'AIzaSyAKSL7OBjXzwhVuZLN0bbCzEsCZntbSmW4';
  console.log("Testing Gemini Key:", key);
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log("Gemini Success! Response:", response.text());
  } catch (error) {
    console.error("Gemini Failure:", error.message);
  }
}

testKey();
