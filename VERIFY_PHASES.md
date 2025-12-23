# Phase B & C Verification Guide

## 1. Environment Setup
You must configure your API keys for the application to work.
1. Open the `.env` file in the project root.
2. Replace `your_elevenlabs_api_key_here` with your actual **ElevenLabs API Key**.
3. Ensure `GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_CLOUD_PROJECT` is set correctly if you are using Vertex AI (Phase D).

## 2. Verify Backend (Phase B)
The server is set up with Express, CORS (implicit), and Health checks.
- Run: `npm start`
- Check: `http://localhost:3000/health` should return `{"status":"ok", ...}`.

## 3. Verify ElevenLabs TTS (Phase C)
This tests converting text to speech.
- Run: `node test_tts.js`
- **Expected Output**: 
  - Console: `TTS Success! Audio received.`
  - File: A new file `output_audio.mp3` should appear in the project folder.

## 4. Verify ElevenLabs STT (Phase C)
This tests converting speech (the audio file we just made) back to text.
- Run: `node test_stt.js`
- **Expected Output**:
  - Console: `Transcription: "Hello! This is a test..."` (or similar).

## Troubleshooting
- **401 Unauthorized**: Check your API Key in `.env`.
- **ENOENT**: Ensure `output_audio.mp3` exists before running the STT test.
