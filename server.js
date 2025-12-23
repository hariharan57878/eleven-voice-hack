// server.js
// Express server for ElevenLabs + Gemini Hackathon project

require('dotenv').config(); // Load environment variables

const express = require("express");
const app = express();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const multer = require('multer');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configure Multer for handling file uploads (audio for STT)
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// ----- LLM CONFIGURATION (GROQ + FALLBACKS) -----
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini (Legacy/Fallback)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "key_missing");
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// API Helper: Call Groq
async function callGroqAPI(prompt) {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing");

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant", // Fast and efficient model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    },
    {
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data.choices[0].message.content;
}

// Unified LLM Generator
async function generateLLMResponse(prompt) {
  // 1. Try Groq (Fastest)
  if (GROQ_API_KEY) {
    try {
      console.log("Generating with Groq...");
      return await callGroqAPI(prompt);
    } catch (error) {
      console.error("Groq failed, trying fallback...", error.message);
    }
  }

  // 2. Try Gemini (Fallback)
  if (GEMINI_API_KEY) {
    try {
      console.log("Generating with Gemini...");
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini failed...", error.message);
    }
  }

  // 3. Mock (Final Fallback)
  console.log("Using MOCK response (No valid API keys found)");
  return "I am running in mock mode. Please add a GROQ_API_KEY or GEMINI_API_KEY to your .env file.";
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    provider: GROQ_API_KEY ? "Groq" : (GEMINI_API_KEY ? "Gemini" : "Mock"),
    timestamp: new Date().toISOString()
  });
});

// ----- API: GENERATE (LLM Only) -----
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    console.log("Received prompt:", prompt);
    const text = await generateLLMResponse(prompt);

    console.log("LLM response:", text);
    res.json({ success: true, text: text });

  } catch (error) {
    console.error("LLM Error:", error);
    res.status(500).json({ error: "Failed to generate content", details: error.message });
  }
});

// ----- ELEVENLABS TTS IMPLEMENTATION -----

app.post("/api/tts", async (req, res) => {
  try {
    const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
    console.log("Loaded API Key for TTS:", ELEVEN_API_KEY ? "Yes" : "No");

    if (!ELEVEN_API_KEY) {
      return res.status(500).json({ error: "ELEVEN_API_KEY is not set" });
    }

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text field is required" });

    const voiceId = req.body.voiceId || "21m00Tcm4TlvDq8ikWAM"; // Rachel or provided voice
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await axios({
      method: "POST",
      url: url,
      data: {
        text: text,
        model_id: "eleven_turbo_v2_5" // Upgraded model
      },
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer"
    });

    const audioBase64 = Buffer.from(response.data).toString('base64');
    res.json({ success: true, message: "Generated TTS successfully!", audio: audioBase64 });

  } catch (error) {
    console.error("TTS Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to generate TTS", details: error.message });
  }
});

// ----- ELEVENLABS STT IMPLEMENTATION -----

app.post("/api/stt", upload.single('audio'), async (req, res) => {
  try {
    const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
    if (!ELEVEN_API_KEY) return res.status(500).json({ error: "ELEVEN_API_KEY is not set" });
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    // Use WebM for browser compatibility
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: 'audio.webm',
      contentType: req.file.mimetype || 'audio/webm',
    });
    formData.append('model_id', 'scribe_v1');
    formData.append('language_code', 'eng');

    const response = await axios.post('https://api.elevenlabs.io/v1/speech-to-text', formData, {
      headers: { ...formData.getHeaders(), 'xi-api-key': ELEVEN_API_KEY },
    });

    res.json({ success: true, text: response.data.text });

  } catch (error) {
    console.error("STT Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to perform STT", details: error.response ? error.response.data : error.message });
  }
});

// ----- CONVERSATION PIPELINE (PHASE E) -----

app.post("/api/conversation", upload.single('audio'), async (req, res) => {
  try {
    const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
    if (!ELEVEN_API_KEY) return res.status(500).json({ error: "ELEVEN_API_KEY is not set" });
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    // Get Voice ID from request body (Multer parses text fields too)
    const voiceId = req.body.voiceId || "21m00Tcm4TlvDq8ikWAM"; // Default to Rachel
    console.log("--- Starting Conversation Pipeline ---");
    console.log("Selected Voice ID:", voiceId);

    // 1. STT
    console.log("1. STT: Processing audio...");
    const sttFormData = new FormData();
    sttFormData.append('file', req.file.buffer, {
      filename: 'audio.webm', // Explicitly use webm as that is what frontend sends now
      contentType: req.file.mimetype || 'audio/webm',
    });
    sttFormData.append('model_id', 'scribe_v1');
    // Force English transcription
    sttFormData.append('language_code', 'eng');
    sttFormData.append('tag', 'audio_hq'); // Hint for high quality input

    const sttResponse = await axios.post('https://api.elevenlabs.io/v1/speech-to-text', sttFormData, {
      headers: { ...sttFormData.getHeaders(), 'xi-api-key': ELEVEN_API_KEY }, // Use sttFormData headers
    });
    const userText = sttResponse.data.text;
    console.log("   User said:", userText);

    if (!userText) return res.json({ success: true, message: "No speech detected." });

    // 2. LLM (Unified Provider)
    console.log("2. LLM: Generating response...");
    const aiText = await generateLLMResponse(userText);
    console.log("   AI reply:", aiText);

    // 3. TTS
    console.log("3. TTS: Generating audio...");
    // const voiceId is already defined at the top of the route
    const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const ttsResponse = await axios({
      method: "POST",
      url: ttsUrl,
      data: {
        text: aiText,
        model_id: "eleven_turbo_v2_5"
      },
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer"
    });

    const audioBase64 = Buffer.from(ttsResponse.data).toString('base64');

    res.json({
      success: true,
      userText: userText,
      aiText: aiText,
      audio: audioBase64
    });
    console.log("--- Pipeline Complete ---");

  } catch (error) {
    console.error("Pipeline Error Full:", error);
    res.status(500).json({ error: "Conversation pipeline failed", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
