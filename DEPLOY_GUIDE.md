# Deployment Guide

Follow these steps to deploy your application for the hackathon submission.

## 1. Backend Deployment (Google Cloud Run or Render)

### Option A: Render (Easiest)
1. Push your code to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com/).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**: Add `ELEVEN_API_KEY`, `GEMINI_API_KEY`, etc.
6. Click **Deploy**. Copy the URL (e.g., `https://my-voice-app.onrender.com`).

### Option B: Google Cloud Run (Official)
1. Install Google Cloud SDK.
2. Run `gcloud init` and login.
3. Run:
   ```bash
   gcloud run deploy --source .
   ```
4. Follow the prompts (Region: `us-central1`, Allow unauthenticated: `y`).
5. Set Env Vars in the Google Cloud Console for the Cloud Run service.

## 2. Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. **Important**: Change the **Root Directory** to `frontend`.
5. **Environment Variables**:
   In your specific case, you need to point the frontend to the backend.
   - If your frontend uses `localhost:3000` hardcoded, you MUST change it to the backend URL from Step 1.
   - Edit `frontend/src/App.jsx` or creating a `.env` in frontend: `VITE_API_URL=https://your-backend-url.com`.
6. Click **Deploy**.

## 3. Final Check

1. Open the Vercel URL.
2. Test the Microphone.
3. Test the "Helping Agent".

**Good Luck!**
