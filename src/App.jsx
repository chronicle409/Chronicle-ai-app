import FindoraRecorder from "./FindoraRecorder"

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">♪</div>
          <span>FINDORA</span>
        </div>
      </header>

      <main className="main-content">
        <h2 className="title">Identify music instantly</h2>
        <p className="subtitle">Tap to record and find your song</p>
        
        <FindoraRecorder />
      </main>

      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        .app {
          min-height: 100vh;
          background: #f8fbff;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          display: flex;
          flex-direction: column;
        }
        .app-header {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #2f88ff;
          font-weight: 800;
          font-size: 18px;
          letter-spacing: -0.5px;
        }
        .logo-icon {
          width: 28px;
          height: 28px;
          background: #2f88ff;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          text-align: center;
        }
        .title {
          color: #1a1a1a;
          font-size: 24px;
          font-weight: 700;
          margin-top: 10px;
        }
        .subtitle {
          color: #666;
          font-size: 15px;
          margin-top: 8px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}import React, { useRef, useState, useEffect } from "react";

export default function FindoraRecorder() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const animRef = useRef(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 320;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const center = size / 2;

    function animate() {
      ctx.clearRect(0, 0, size, size);
      const radius = 105;
      const data = new Uint8Array(128);
      if (analyserRef.current) analyserRef.current.getByteFrequencyData(data);

      for (let i = 0; i < 180; i++) {
        const angle = (i / 180) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius, 1.7, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 7;
        ctx.shadowColor = "#FFFFFF";
        ctx.fill();
      }
      for (let i = 0; i < 150; i++) {
        const angle = (i / 150) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(center + Math.cos(angle) * 91, center + Math.sin(angle) * 91, 1, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 0;
        ctx.fill();
      }
      for (let i = 0; i < 180; i++) {
        const angle = (i / 180) * Math.PI * 2;
        const frequency = analyserRef.current ? data[Math.floor((i / 180) * 128)] / 255 : 0.15 + Math.sin(Date.now() / 250 + i * 0.3) * 0.1;
        const length = 5 + frequency * 48;
        ctx.beginPath();
        ctx.moveTo(center + Math.cos(angle) * 112, center + Math.sin(angle) * 112);
        ctx.lineTo(center + Math.cos(angle) * (112 + length), center + Math.sin(angle) * (112 + length));
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#FFFFFF";
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.start();
      setRecording(true);
    } catch { alert("Please allow microphone access."); }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorderRef.current.mimeType });
        const url = URL.createObjectURL(blob);
        console.log("Recording:", url);
      };
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    analyserRef.current = null;
    setRecording(false);
  }

  return (
    <div className="recorder-wrapper">
      <div className="visualizer-box">
        <canvas ref={canvasRef} />
      </div>
      <button onClick={recording ? stopRecording : startRecording} className="record-btn">
        {recording ? "Stop recording" : "Start recording"}
      </button>

      <style>{`
        .recorder-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 10px;
        }
        .visualizer-box {
          width: min(90vw, 340px);
          aspect-ratio: 1;
          background: #000;
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .visualizer-box canvas {
          width: 100%;
          height: 100%;
        }
        .record-btn {
          margin-top: 22px;
          padding: 14px 32px;
          border: none;
          border-radius: 30px;
          background: white;
          color: #2f88ff;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .record-btn:active { transform: scale(0.96); }
      `}</style>
    </div>
  );
      }
