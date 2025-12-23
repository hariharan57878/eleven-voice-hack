import { useState, useRef } from 'react';
import axios from 'axios';
import './App.css'; // Reusing App.css for consistency

export function Tools() {
  const [ttsText, setTtsText] = useState('');
  const [ttsStatus, setTtsStatus] = useState('idle'); // idle, loading, playing
  const [sttStatus, setSttStatus] = useState('idle'); // idle, recording, processing
  const [transcription, setTranscription] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- TTS Functionality ---
  const handleTts = async () => {
    if (!ttsText.trim()) return;

    setTtsStatus('loading');
    try {
      const response = await axios.post('/api/tts', { text: ttsText });

      if (response.data.success && response.data.audio) {
        const audioUrl = `data:audio/mpeg;base64,${response.data.audio}`;
        const audio = new Audio(audioUrl);
        setTtsStatus('playing');
        audio.play();
        audio.onended = () => setTtsStatus('idle');
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setTtsStatus('error');
      setTimeout(() => setTtsStatus('idle'), 2000);
    }
  };

  // --- STT Functionality ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = processAudio;
      mediaRecorderRef.current.start();
      setSttStatus('recording');
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && sttStatus === 'recording') {
      mediaRecorderRef.current.stop();
      setSttStatus('processing');
    }
  };

  const processAudio = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'stt_test.mp3');

    try {
      const response = await axios.post('/api/stt', formData);
      setTranscription(response.data.text || "No speech detected");
      setSttStatus('idle');
    } catch (error) {
      console.error("STT Error:", error);
      setTranscription("Error transcribing audio.");
      setSttStatus('idle');
    }
  };

  return (
    <div className="glass-card tools-container" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Voice Tools</h2>

      <div className="tools-grid">
        {/* Text to Speech Section */}
        <div className="tool-section">
          <h3>Text to Speech</h3>
          <div className="input-group">
            <textarea
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Type something to hear..."
              rows={3}
              className="text-input"
            />
            <button
              className="btn-primary"
              onClick={handleTts}
              disabled={ttsStatus !== 'idle'}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {ttsStatus === 'loading' ? 'Generating...' :
                ttsStatus === 'playing' ? 'Playing...' : 'Speak Text'}
            </button>
          </div>
        </div>

        {/* Speech to Text Section */}
        <div className="tool-section">
          <h3>Speech to Text</h3>
          <div className="stt-controls">
            <button
              className={`btn-primary ${sttStatus === 'recording' ? 'recording' : ''}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={sttStatus === 'processing'}
            >
              {sttStatus === 'recording' ? 'Release to Transcribe' :
                sttStatus === 'processing' ? 'Processing...' : 'Hold to Speak'}
            </button>
            <div className="transcription-result">
              {transcription || <span className="placeholder">Transcription will appear here...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
