# VoiceGenie - Conversational AI Assistant

**VoiceGenie** is a next-generation voice assistant built for the **ElevenLabs x Gemini Hackathon**. It combines the reasoning power of **Google Gemini 1.5** with the ultra-realistic voice synthesis of **ElevenLabs** to create a seamless, real-time conversational experience.

![VoiceGenie Demo](https://via.placeholder.com/800x400?text=VoiceGenie+Demo+Screenshot) 
*(Please replace this image link with your actual screenshot)*

## 🚀 Key Features

*   **🗣️ Real-time Voice Conversation**: Talk naturally to the AI and hear instant responses.
*   **🧠 Intelligent Reasoning**: Powered by **Google Gemini 1.5 Flash** for smart, context-aware answers.
*   **🔊 Ultra-Realistic Speech**: Utilizes **ElevenLabs Turbo v2.5** for low-latency, human-like voice output.
*   **🎨 Immersive 3D UI**: A beautiful React frontend featuring a dynamic 3D background using **Three.js**.
*   **🤖 Conversational Agent**: Includes a dedicated "Helping Agent" mode for continuous interaction.

## 🛠️ Tech Stack

### Frontend
*   **React 18** (Vite)
*   **Three.js** (@react-three/fiber) - fluid 3D backgrounds
*   **ElevenLabs React SDK** - for seamless agent connection
*   **Axios** - API communication

### Backend
*   **Node.js & Express**
*   **Google Vertex AI SDK** (Gemini 1.5)
*   **ElevenLabs API** (TTS/STT/Turbo v2.5)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd eleven-voice-hack
    ```

2.  **Install Dependencies**
    ```bash
    # Install Backend Deps
    npm install

    # Install Frontend Deps
    cd frontend
    npm install
    cd ..
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    ELEVEN_API_KEY=your_elevenlabs_key
    GEMINI_API_KEY=your_gemini_key
    GROQ_API_KEY=your_groq_key_optional
    PORT=3000
    ```

4.  **Run the Application**

    **Start Backend:**
    ```bash
    npm start
    ```

    **Start Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```

    Open [http://localhost:5173](http://localhost:5173) to view the app!

## 📸 Demo

Check out our submission video here: [Watch Demo on YouTube](https://youtu.be/GW5qI2DGFPk)

## 📄 License

MIT License.
