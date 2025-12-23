require('dotenv').config();
const axios = require('axios');

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GROQ_API_KEY is missing in .env");
    return;
  }
  console.log("✅ Found GROQ_API_KEY:", apiKey.slice(0, 10) + "...");

  try {
    console.log("📡 Sending test request to Groq...");
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "Hello! reply with 'Groq is working!' and nothing else." }],
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    console.log("\n🎉 Success! Groq responded:");
    console.log(">>", reply);

  } catch (error) {
    console.error("\n❌ Request Failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testGroq();
