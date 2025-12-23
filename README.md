# ElevenLabs + Google Cloud (Gemini) — Complete Work Plan

**Goal:** Build a voice-first AI assistant that listens to user speech, uses Google Gemini (Vertex AI) to generate intelligent responses, and speaks back using ElevenLabs TTS. Delivered as a web demo (React frontend + Node backend), deployed on Google Cloud, and submitted to Devpost.

---

## High-level milestones

1. **Setup & accounts** — GitHub, ElevenLabs, Google Cloud project & service account (without redeeming credits yet)
2. **Local backend scaffold** — Express server + health & TTS endpoints
3. **ElevenLabs integration** — Server-side TTS + STT testing
4. **Vertex AI (Gemini) integration** — Server calls LLM to generate responses
5. **Frontend** — Simple React app to record voice, show transcript, and play response audio
6. **Real-time / Agent SDK (optional / advanced)** — swap to ElevenLabs Agent SDK or WebRTC for low latency conversation
7. **RAG (optional)** — vector DB + retrieval to ground answers in documents
8. **Deploy to Google Cloud** — Cloud Run (backend), Firebase/Hosting (frontend)
9. **Monitoring & safety** — logs, simple metrics, rate limiting, and content safety
10. **Demo & submission** — video recording, README, Devpost form and repo polish

---

## Detailed step-by-step plan

### Phase A — Preparation (Done / Quick checks)

1. Create GitHub repo (public, MIT license).
   * **Deliverable:** repo URL.
2. Create ElevenLabs account & API key and save locally.
   * **Deliverable:** key saved in `keys/` (not committed).
3. Create Google Cloud project (`eleven-voice-hack-...`) and service account with JSON key.
   * **Deliverable:** service account JSON in `~/keys/vertex-credentials.json`.
4. Do **not** redeem hackathon credits yet — build locally first to avoid wasting coupons.

---

### Phase B — Local Backend (Express) — Core foundations

**Why:** A reliable backend orchestrates calls to Gemini and ElevenLabs and hides API keys.

1. Initialize Node project (`npm init -y`), install `express`, `axios`.
2. Create `server.js` with:
   * `/health` GET
   * `/api/tts` POST → ElevenLabs TTS (save audio file)
   * `/api/ttstemp` stub for early tests
   * `/api/gemini` POST → call Vertex AI (later)
3. Use environment variables:
   * `ELEVEN_API_KEY`
   * `GOOGLE_APPLICATION_CREDENTIALS` (path to JSON)
4. Test locally: `curl` or Postman requests to endpoints.

* **Deliverable:** working `server.js`, `npm start` prints server running, `/health` returns JSON.

---

### Phase C — ElevenLabs TTS & STT (voice IO)

**Why:** Make the assistant speak and understand voice.

1. Implement server-side TTS that calls ElevenLabs:
   * POST text → save `output_audio.mp3`
   * Return audio filename / stream audio response
2. Test by generating audio via `curl` and playing file locally.
3. Implement basic STT test (if ElevenLabs STT exposed) — record local audio file and send to ElevenLabs STT endpoint, validate transcript.
4. Confirm privacy/usage: do not clone real voices without consent.

* **Deliverable:** endpoint that turns text into playable audio and a tested STT route.

---

### Phase D — Vertex AI (Gemini) integration

**Why:** Enable the agent to *think* — generate intelligent replies.

1. Add server endpoint `/api/generate`:
   * Accepts `{ prompt, history? }`.
   * Calls Vertex AI Generative Models (Gemini) using service account credentials.
   * Returns text output (and optional structured actions).
2. Implement a simple prompt template and conversation history handling.
3. Test the LLM by sending sample prompts and verifying responses.

* **Deliverable:** working LLM integration that returns natural responses.

---

### Phase E — Connect LLM → TTS pipeline

**Why:** Complete the voice loop: User speech → STT → Gemini → TTS → play audio.

1. Flow:
   * Frontend records user voice (or uploads file) → POST to `/api/stt` → get text.
   * Server sends text + context to `/api/generate` (Gemini).
   * Server sends generated text to `/api/tts` (ElevenLabs) and returns audio or stream URL.
2. Implement and test full single-turn voice exchange.

* **Deliverable:** demo script where user speaks a question and hears the assistant reply.

---

### Phase F — Frontend (React) — user interface

**Why:** Friendly demo UI that records, displays transcript, and plays responses.

1. Create React app (`create-react-app` or Vite).
2. Pages/Components:
   * `Home`: big mic button, transcript pane, response audio player.
   * `Settings`: choose voice, adjust speaking rate.
   * `Session`: shows conversation history.
3. Use `fetch` or `axios` to call backend endpoints.
4. Add UI polish: loader during TTS generation, transcripts, playback controls, disclaimers.

* **Deliverable:** hosted frontend that interacts with backend and demonstrates voice-first flow.

---

### Phase G — Optional Advanced: ElevenLabs Agents / Real-time

**Why:** If time permits, switch to ElevenLabs Agents/SDK for better turn-taking and real-time audio streaming.

1. Replace turn-based flow with the ElevenLabs React SDK or WebRTC path.
2. Use websockets / LiveKit if needed to stream audio in both directions.

* **Deliverable:** lower-latency real-time demo (impressive but optional).

---

### Phase H — Optional: RAG (Retrieval Augmented Generation)

**Why:** Ground responses in reliable documents (FAQs, product docs) — increases accuracy.

1. Ingest documents into a vector DB (Pinecone, Weaviate, or Vertex Matching).
2. On each query, retrieve top-K context, include in prompt to Gemini.

* **Deliverable:** evidence-backed answers with citations.

---

### Phase I — Deploy to Google Cloud

**Why:** Deliver an accessible hosted demo and satisfy hack requirement.

1. Redeem hackathon credits only now (once ready to test in cloud).
2. Deploy backend to **Cloud Run**:
   * Containerize Node app (Dockerfile).
   * `gcloud builds submit` → `gcloud run deploy`.
3. Deploy frontend to **Firebase Hosting** or Host on Cloud Run with static hosting.
4. Set production environment variables securely (Secret Manager or Cloud Run env vars).

* **Deliverable:** public demo URL.

---

### Phase J — Monitoring, Safety & Observability

**Why:** Judges love production-ready features.

1. Add basic logging (structured JSON) for requests, errors, latencies.
2. Implement rate-limiting to protect API keys and avoid runaway costs.
3. Add simple content filter on Gemini outputs (block harmful prompts).
4. Optional: integrate Datadog or GCP Cloud Monitoring to track errors and latency.

* **Deliverable:** logs and a short dashboard screenshot.

---

### Phase K — Testing, Documentation & Submission

1. Record a **3-minute demo video**: show user flow, some edge cases, architecture slide.
2. Finalize README: architecture diagram, how to run locally, deploy steps, env var list (no secrets).
3. Add LICENSE (MIT), app screenshots, and Devpost submission form ready.
4. Push and tag release.

---

## Repo structure (recommended)

```
/eleven-voice-hack
  /backend
    server.js
    package.json
    Dockerfile
  /frontend
    (React app)
  /docs
    architecture.md
    demo-script.md
  /keys         (gitignored)
  README.md
  LICENSE
```

---

## Environment variables (local & production)

* `ELEVEN_API_KEY` — ElevenLabs API key (keep secret)
* `GOOGLE_APPLICATION_CREDENTIALS` — path to JSON (local) / use Secret Manager in prod
* Optional:
  * `PORT`
  * `VOICE_ID` (ElevenLabs voice)
  * `NODE_ENV`
