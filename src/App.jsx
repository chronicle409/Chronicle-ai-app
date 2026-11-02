import React, { useState, useRef, useEffect } from "react";
import "./FindoraHome.css";

export default function FindoraHome() {
  const [page, setPage] = useState(0);
  const [recording, setRecording] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [flashAnim, setFlashAnim] = useState(false);

  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const videoRef = useRef(null);
  const touchStart = useRef(0);

  // WHITE CIRCULAR AUDIO VISUALIZER - WAVE IN MIDDLE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 320;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frame;
    let time = 0;

    function animate() {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const data = new Uint8Array(128);
      if (analyserRef.current) analyserRef.current.getByteFrequencyData(data);

      for (let i = 0; i < 180; i++) {
        const angle = i * Math.PI * 2 / 180;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * 105, cy + Math.sin(angle) * 105, 1.7, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.shadowColor = "white";
        ctx.shadowBlur = 7;
        ctx.fill();
      }
      for (let i = 0; i < 150; i++) {
        const angle = i * Math.PI * 2 / 150;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * 91, cy + Math.sin(angle) * 91, 1, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      }
      for (let i = 0; i < 180; i++) {
        const angle = i * Math.PI * 2 / 180;
        const frequency = analyserRef.current ? data[Math.floor(i * 128 / 180)] / 255 : 0.12 + Math.abs(Math.sin(time * 0.04 + i * 0.2)) * 0.12;
        const length = 5 + frequency * 48;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 112, cy + Math.sin(angle) * 112);
        ctx.lineTo(cx + Math.cos(angle) * (112 + length), cy + Math.sin(angle) * (112 + length));
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.shadowColor = "white";
        ctx.shadowBlur = 10;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      time++;
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOpen]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      await audioContext.resume();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(audio);
        const link = document.createElement("a");
        link.href = url;
        link.download = "findora-recording.webm";
        link.click();
        URL.revokeObjectURL(url);
      };
      recorder.start();
      setRecording(true);
    } catch { alert("Please allow microphone access."); }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    try { audioContextRef.current?.close(); } catch {}
    streamRef.current = null;
    analyserRef.current = null;
    setRecording(false);
  }

  async function openCamera() {
    // Your camera-button animation
    setFlashAnim(true);
    setTimeout(() => setFlashAnim(false), 600);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch { alert("Please allow camera access."); }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  function handleTouchStart(e) { touchStart.current = e.touches[0].clientX; }
  function handleTouchEnd(e) {
    const distance = e.changedTouches[0].clientX - touchStart.current;
    if (distance < -60) setPage(1);
    if (distance > 60) setPage(0);
  }

  return (
    <main className="findora-app" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="findora-pages" style={{ transform: `translateX(-${page * 100}%)` }}>
        
        <section className="findora-page home-page">
          <header className="home-header">
            <div className="search-heading"><span>⌕</span><span>Search</span></div>
            <button className="menu-icon">☰</button>
          </header>
          <div className="home-center">
            <button className={`visualizer-button ${recording ? "active" : ""}`} onClick={recording ? stopRecording : startRecording}>
              <canvas ref={canvasRef} />
            </button>
            {recording && <p className="recording-status">Listening...</p>}
          </div>
          <div className="pagination"><span className={page===0?"selected":""} /><span className={page===1?"selected":""} /><span /></div>
        </section>

        <section className="findora-page camera-page">
          <header className="camera-header">
            <button onClick={() => setPage(0)}>×</button><button>ϟ</button><h2>FINDORA</h2><button>◴</button><button>☰</button>
          </header>
          <div className="camera-center">
            {cameraOpen ? (
              <video ref={videoRef} autoPlay playsInline className="camera-preview" />
            ) : (
              <div className="animated-camera">
                <svg viewBox="0 0 300 250">
                  <g fill="none" stroke="#087BFF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M35 55 H85 L100 25 Q105 15 120 15 H175 Q190 15 195 30 L205 55 H265 Q280 55 280 75 V205 Q280 225 260 225 H35 Q15 225 15 205 V75 Q15 55 35 55Z" />
                    <circle cx="150" cy="140" r="48" />
                    <path d="M35 12 H70" strokeWidth="14" />
                  </g>
                  <circle className={`camera-button ${flashAnim ? 'animate' : ''}`} cx="240" cy="90" r="7" fill="#087BFF" />
                  <circle className={`flash-circle ${flashAnim ? 'show' : ''}`} cx="240" cy="90" r="80" />
                </svg>
              </div>
            )}
            <p className="camera-description">FINDORA uses what your camera sees to find results only while the app is open.</p>
            <p className="privacy-text"><span>Privacy Policy</span> and<span> Terms of Service</span> apply.</p>
            <button className="open-camera" onClick={cameraOpen ? closeCamera : openCamera}><span>📷</span>{cameraOpen ? "Close camera" : "Open camera"}</button>
          </div>
          <footer className="camera-footer">
            <button className="gallery-button">▧</button>
            <button className="search-button" onClick={() => setPage(0)}>⌕</button>
          </footer>
          <div className="pagination camera-pagination"><span /><span className={page===1?"selected":""} /><span /></div>
        </section>

      </div>
    </main>
  );
              }* { box-sizing: border-box; }
html, body, #root { margin: 0; width: 100%; height: 100%; overflow: hidden; font-family: Arial, sans-serif; }
.findora-app { width: 100%; height: 100dvh; overflow: hidden; position: relative; touch-action: pan-y; background: #078eff; }
.findora-pages { display: flex; width: 200%; height: 100%; transition: transform 0.45s ease-in-out; }
.findora-page { width: 50%; height: 100%; flex-shrink: 0; position: relative; overflow: hidden; }

.home-page { background: radial-gradient(circle at 40% 35%, #49c9ff 0%, transparent 45%), linear-gradient(135deg, #32baff, #0087ff); }
.home-header { position: absolute; top: 25px; left: 30px; right: 30px; display: flex; align-items: center; justify-content: space-between; color: white; }
.search-heading { display: flex; align-items: center; gap: 12px; font-size: 23px; font-weight: 600; }
.search-heading span:first-child { font-size: 43px; }
.menu-icon { background: none; border: none; color: white; font-size: 36px; }
.home-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; }
.visualizer-button { width: min(85vw, 340px); aspect-ratio: 1; border: none; background: transparent; padding: 0; cursor: pointer; display: grid; place-items: center; -webkit-tap-highlight-color: transparent; }
.visualizer-button canvas { width: 100%; height: 100%; display: block; }
.visualizer-button.active { animation: recordingPulse 1.5s infinite ease-in-out; }
@keyframes recordingPulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.04)} }
.recording-status { color: white; font-size: 15px; margin-top: 10px; letter-spacing: 2px; }
.pagination { position: absolute; bottom: 35px; left: 50%; transform: translateX(-50%); display: flex; gap: 17px; align-items: center; }
.pagination span { width: 14px; height: 14px; background: rgba(255,255,255,0.35); border-radius: 50%; transition: all 0.3s ease; }
.pagination span.selected { background: white; transform: scale(1.15); }

.camera-page { background: radial-gradient(ellipse at 50% 48%, rgba(130, 112, 80, 0.75), transparent 65%), linear-gradient(140deg, #303238, #59544c, #22252c); color: white; }
.camera-header { position: absolute; top: 25px; left: 25px; right: 25px; display: flex; justify-content: space-between; align-items: center; z-index: 2; }
.camera-header h2 { font-size: 24px; letter-spacing: 1px; }
.camera-header button { background: transparent; color: white; border: none; font-size: 34px; cursor: pointer; }
.camera-center { position: absolute; top: 46%; left: 50%; transform: translate(-50%, -50%); width: 90%; display: flex; flex-direction: column; align-items: center; text-align: center; }
.animated-camera { width: min(75vw, 310px); animation: cameraFloat 2.5s ease-in-out infinite; filter: drop-shadow(0 0 15px rgba(0, 125, 255, 0.3)); }
.animated-camera svg { width: 100%; display: block; overflow: visible; }
@keyframes cameraFloat { 0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.035)} }
.camera-preview { width: min(75vw, 310px); aspect-ratio: 1; object-fit: cover; border-radius: 25px; border: 3px solid #087bff; }
.camera-description { max-width: 600px; margin-top: 65px; font-size: 17px; line-height: 1.5; }
.privacy-text { font-size: 16px; margin-top: 8px; }
.privacy-text span { color: #65b8ff; }
.open-camera { width: min(90%, 500px); min-height: 68px; border: none; border-radius: 50px; background: #b8d3ff; color: #003bb2; font-size: 21px; font-weight: 700; margin-top: 65px; display: flex; justify-content: center; align-items: center; gap: 25px; cursor: pointer; }
.open-camera span { font-size: 30px; }
.camera-footer { position: absolute; bottom: 45px; left: 0; right: 0; display: flex; justify-content: space-around; align-items: center; }
.gallery-button { width: 85px; height: 85px; border: none; border-radius: 50%; background: rgba(0,0,0,0.55); color: white; font-size: 40px; }
.search-button { width: 145px; height: 145px; border: 10px solid rgba(0,130,255,0.3); border-radius: 50%; background: #087bdb; color: white; font-size: 65px; }
.camera-pagination { bottom: 12px; }

/* YOUR CAMERA-BUTTON ANIMATION */
.camera-button { transform-box: fill-box; transform-origin: center; }
.camera-button.animate { animation: shutterClick 0.6s ease-in-out; }
@keyframes shutterClick { 0%{transform:scale(1)}30%{transform:scale(0.88)}60%{transform:scale(1.08)}100%{transform:scale(1)} }
.flash-circle { fill: #087BFF; opacity: 0; transform-origin: 240px 90px; pointer-events: none; }
.flash-circle.show { animation: flashShow 0.6s ease-out forwards; }
@keyframes flashShow { 0%{opacity:0;transform:scale(0.1)}40%{opacity:0.25;transform:scale(0.8)}100%{opacity:0;transform:scale(1.8)} }

@media (max-height: 700px) {
  .camera-center { top: 48%; }
  .animated-camera { width: 180px; }
  .camera-description { margin-top: 20px; font-size: 14px; }
  .open-camera { margin-top: 20px; min-height: 55px; }
  .camera-footer { bottom: 20px; }
  .search-button { width: 90px; height: 90px; }
  .gallery-button { width: 60px; height: 60px; }
  }
