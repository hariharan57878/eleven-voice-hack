import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import { Agent } from './Agent'
import { Tools } from './Tools'
import Background3D from './Background3D'

export default function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState('idle') // idle, recording, processing, playing
  const [conversation, setConversation] = useState([])
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const messagesEndRef = useRef(null)
  const currentAudioRef = useRef(null)

  /* --- State for UI Showcase --- */
  const [activeTab, setActiveTab] = useState('Agents') // Default
  const [selectedVoice, setSelectedVoice] = useState('Samara')
  const [toast, setToast] = useState(null)

  // Tab-specific states
  const [ttsText, setTtsText] = useState('')
  const [sttResult, setSttResult] = useState({ text: '', isListening: false })
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null)

  // Custom Language Selector State
  const [language, setLanguage] = useState('eng')
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)

  const languages = [
    { id: 'eng', label: 'ENGLISH', flag: '🇺🇸' },
    { id: 'esp', label: 'SPANISH', flag: '🇪🇸' },
    { id: 'fre', label: 'FRENCH', flag: '🇫🇷' },
    { id: 'ger', label: 'GERMAN', flag: '🇩🇪' },
    { id: 'hin', label: 'HINDI', flag: '🇮🇳' },
  ]

  const voices = [
    { id: 'Samara', desc: 'Narrate a story', color: '#a855f7' },
    { id: 'Spuds', desc: 'Recount an old story', color: '#3b82f6' },
    { id: 'Jessica', desc: 'Provide customer support', color: '#f43f5e' },
    { id: 'Eric', desc: 'Voiceover a game', color: '#10b981' },
    { id: 'Sergeant', desc: 'Play a drill sergeant', color: '#f59e0b' },
  ]

  // Voice ID Mapping
  const VOICE_MAP = {
    'Samara': '21m00Tcm4TlvDq8ikWAM',
    'Spuds': '2EiwWnXFnvU5JabPnv8n',
    'Jessica': 'EXAVITQu4vr4xnSDxMaL',
    'Eric': 'JBFqnCBsd6RMkjVDRZzb',
    'Sergeant': 'ErXwobaYiN019PkySvjV'
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setStatus('idle')
    setIsRecording(false)
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop()
  }

  // --- LOGIC: AGENTS & STT RECORDING ---
  const stopPlayback = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
      setStatus('idle')
    }
  }

  const toggleRecording = () => {
    stopPlayback()
    isRecording ? stopRecording() : startRecording()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Better MIME type detection
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const options = { mimeType };
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      // Route to correct handler based on tab
      mediaRecorderRef.current.onstop = activeTab === 'Speech to Text' ? handleSTTStop : handleConversationStop

      // Start with 200ms timeslice to ensure data is captured even in short clips
      mediaRecorderRef.current.start(200)
      setIsRecording(true)
      setStatus('recording')
      if (activeTab === 'Speech to Text') setSttResult(prev => ({ ...prev, isListening: true }))

      console.log(`Microphone started with ${mimeType}`)
    } catch (error) {
      console.error("Mic Error:", error)
      showToast("Error: Could not access microphone.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      // Stop all tracks to release the mic
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      setIsRecording(false)
      setStatus('processing')
      if (activeTab === 'Speech to Text') setSttResult(prev => ({ ...prev, isListening: false }))
      console.log("Recording stopped")
    }
  }

  // Handle "Agents" (Voice to Voice)
  const handleConversationStop = async () => {
    await new Promise(r => setTimeout(r, 100)); // Short wait for last chunk

    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

    console.log(`Audio recorded: ${audioBlob.size} bytes, Type: ${mimeType}`)

    if (audioBlob.size < 100) {
      console.warn("Audio too short or empty")
      showToast("Recording too short. Please try again.")
      return setStatus('idle')
    }

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('voiceId', VOICE_MAP[selectedVoice] || '21m00Tcm4TlvDq8ikWAM')

    try {
      const response = await axios.post('/api/conversation', formData)
      const { userText, aiText, audio } = response.data

      stopPlayback()
      const audioObj = new Audio(`data:audio/mpeg;base64,${audio}`)
      currentAudioRef.current = audioObj
      setStatus('playing')
      audioObj.play()
      audioObj.onended = () => {
        setStatus('idle')
        currentAudioRef.current = null
      }

      setConversation(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: aiText }])
    } catch (error) {
      console.error(error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  // --- LOGIC: SPEECH TO TEXT ---
  const handleSTTStop = async () => {
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
    if (audioBlob.size === 0) return

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      const response = await axios.post('/api/stt', formData)
      setSttResult({ text: response.data.text, isListening: false })
      setStatus('idle')
    } catch (error) {
      console.error(error)
      setStatus('idle')
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setStatus('processing')
    showToast("Uploading and transcribing...")

    const formData = new FormData()
    formData.append('audio', file)

    try {
      const response = await axios.post('/api/stt', formData)
      setSttResult({ text: response.data.text, isListening: false })
      setStatus('idle')
      showToast("Transcription complete!")
    } catch (error) {
      console.error(error)
      setStatus('error')
      showToast("Transcription failed.")
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  // --- LOGIC: TEXT TO SPEECH ---
  // --- LOGIC: TEXT TO SPEECH ---
  const handleTTS = async () => {
    if (!ttsText) return showToast("Please enter some text first!")
    setStatus('processing')
    try {
      const response = await axios.post('/api/tts', {
        text: ttsText,
        voiceId: VOICE_MAP[selectedVoice] || '21m00Tcm4TlvDq8ikWAM' // Pass selected voice
      })

      const audioUrl = `data:audio/mpeg;base64,${response.data.audio}`
      setTtsAudioUrl(audioUrl) // Save for download

      stopPlayback()
      const audioObj = new Audio(audioUrl)
      currentAudioRef.current = audioObj
      setStatus('playing')
      audioObj.play()
      audioObj.onended = () => {
        setStatus('idle')
        currentAudioRef.current = null
      }
    } catch (error) {
      console.error(error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  const getTTSAudioUrl = () => ttsAudioUrl

  const handleDownload = () => {
    if (!ttsAudioUrl) return
    const link = document.createElement('a')
    link.href = ttsAudioUrl
    link.download = `voice_generation_${Date.now()}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderWithEmotions = (text) => {
    if (!text) return null
    return text.split(/(\[.*?\])/g).map((part, i) =>
      (part.startsWith('[') && part.endsWith(']')) ? <span key={i} className="emotion-tag">{part}</span> : part
    )
  }

  // Auto-scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [conversation])

  return (
    <div className="app-container">
      <Background3D />
      {toast && <div className="toast-container"><span>ℹ️</span> {toast}</div>}

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">IIElevenLabs</div>
      </nav>

      {/* Hero Content */}
      <main className="hero-section">
        <h1 className="hero-h1">Experience the Future of Voice AI</h1>
        <p className="hero-sub">Seamlessly conversational. Powered by Gemini 1.5 Flash and ElevenLabs for ultra-low latency interactions.</p>

        {/* 3 SELECTED TABS */}
        <div className="product-tab-row">
          {['Agents', 'Text to Speech', 'Speech to Text'].map(tab => (
            <div key={tab} className={`product-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => handleTabClick(tab)}>
              {activeTab === tab ? '✨' : ''} {tab}
            </div>
          ))}
        </div>

        {/* DYNAMIC CARD CONTENT */}
        <div className="demo-card">
          <div className="demo-content">

            {/* VIEW: AGENTS */}
            {activeTab === 'Agents' && (
              <>
                {conversation.length === 0 ? (
                  <div style={{ color: '#6b7280', textAlign: 'center', marginTop: '4rem' }}>
                    <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>Interactive Agent Demo</h3>
                    <p>Speak to the AI. It uses Gemini for intelligence and ElevenLabs for voice.</p>
                  </div>
                ) : (
                  <div className="chat-container">
                    {conversation.map((msg, index) => (
                      <div key={index} className={`chat-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                        <div className="chat-bubble">
                          {msg.role === 'ai' && <span className="chat-label">Gemini</span>}
                          {renderWithEmotions(msg.text)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}

            {/* VIEW: TTS */}
            {activeTab === 'Text to Speech' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <textarea
                  className="input-field"
                  style={{
                    flex: 1,
                    resize: 'none',
                    fontFamily: 'var(--font-main)',
                    border: '1px solid #e5e7eb', // Added border for clarity 
                    background: '#f9fafb',
                    fontSize: '1.2rem',
                    padding: '1.5rem',
                    boxShadow: 'inner',
                    borderRadius: '12px',
                    minHeight: '350px' // Force minimum height
                  }}
                  placeholder="Type something here... e.g. [whispers] The forest was quiet."
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                />
              </div>
            )}

            {/* VIEW: STT */}
            {activeTab === 'Speech to Text' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                {/* Large Text Area for Output */}
                <div
                  style={{
                    flex: 1,
                    width: '100%',
                    minHeight: '300px',
                    maxHeight: '500px', // Prevent infinite growth
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '2rem',
                    overflowY: 'auto',
                    fontSize: '1.3rem',
                    fontWeight: '500',
                    color: '#374151',
                    lineHeight: '1.8',
                    textAlign: sttResult.text ? 'left' : 'center',
                    display: 'flex',
                    alignItems: sttResult.text ? 'flex-start' : 'center',
                    justifyContent: sttResult.text ? 'flex-start' : 'center'
                  }}
                >
                  {sttResult.text || <span style={{ color: '#9ca3af' }}>Press capture to record or upload an audio file...</span>}
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <input
                    type="file"
                    id="stt-upload"
                    style={{ display: 'none' }}
                    accept="audio/*"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="stt-upload" className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #e5e7eb' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Upload Audio File
                  </label>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem', textAlign: 'center' }}>or use the mic button below</div>
                </div>
              </div>
            )}

          </div>

          {/* Voice Selector (Positions above Bottom Bar for Agents and TTS) */}
          {(activeTab === 'Agents' || activeTab === 'Text to Speech') && (
            <div className="voice-selector-container">
              <div className="voice-selector-row">
                {voices.map(voice => (
                  <div key={voice.id} className={`voice-pill ${selectedVoice === voice.id ? 'selected' : ''}`} onClick={() => setSelectedVoice(voice.id)}>
                    <div className="voice-avatar" style={{ background: `linear-gradient(135deg, ${voice.color}, #eee)` }}></div>
                    <div className="voice-info"><span className="voice-name">{voice.id}</span><span className="voice-desc">{voice.desc}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Bar (Controls) */}
          <div className="demo-bottom-bar">
            {/* Language Selector */}
            <div className="custom-select-container">
              <div className="custom-select-trigger" onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}>
                <span style={{ fontSize: '1.2rem' }}>{languages.find(l => l.id === language)?.flag}</span>
                <span>{languages.find(l => l.id === language)?.label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isLangMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {isLangMenuOpen && (
                <div className="custom-select-dropdown">
                  {languages.map(lang => (
                    <div
                      key={lang.id}
                      className={`custom-option ${language === lang.id ? 'selected' : ''}`}
                      onClick={() => { setLanguage(lang.id); setIsLangMenuOpen(false); }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Play/Record/Download Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

              {/* STATUS TEXT (Processing...) */}
              {status === 'processing' && <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Generating Audio...</span>}

              {/* DOWNLOAD BUTTON (TTS Only) */}
              {activeTab === 'Text to Speech' && getTTSAudioUrl() && (
                <button
                  className="btn-circle-outline"
                  onClick={handleDownload}
                  title="Download Audio"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
              )}

              {/* MAIN PLAY ACTION */}
              <button
                className={`play-button ${activeTab === 'Text to Speech' ? 'pill-shape' : 'circle-shape'}`}
                onClick={activeTab === 'Text to Speech' ? handleTTS : toggleRecording}
                disabled={status === 'processing' || (activeTab === 'Text to Speech' && !ttsText)}
                style={{
                  backgroundColor: (status === 'recording' || sttResult.isListening) ? '#ef4444' : '#000',
                  transform: (status === 'recording' || sttResult.isListening) ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: (status === 'recording' || sttResult.isListening) ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : 'none',
                  width: activeTab === 'Text to Speech' ? 'auto' : '48px',
                  padding: activeTab === 'Text to Speech' ? '0 1.5rem' : '0',
                  borderRadius: activeTab === 'Text to Speech' ? '999px' : '50%',
                }}
              >
                {(status === 'recording' || sttResult.isListening) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="pulsing-record-dot"></div>
                    {/* Only show text if enough space (TTS mode) or if we expand the button */}
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '10px' }}>STOP</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {status === 'playing' ? (
                      <span>❚❚ {activeTab === 'Text to Speech' ? 'PAUSE' : ''}</span>
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ fill: 'white', stroke: 'white' }}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        {activeTab === 'Text to Speech' && <span>PLAY</span>}
                      </>
                    )}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Wave Graphic */}
      <div className="wave-graphic"></div>

      {/* Agent Widget (Visible) */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        <Agent />
      </div>
    </div>
  )
}
