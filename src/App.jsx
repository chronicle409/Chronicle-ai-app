"use client";

import { useState, useRef, useEffect } from "react";
import "./AudioVisualizer.css";

export default function AudioVisualizer() {
  const [recording, setRecording] = useState(false);
  const barsRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const bars = Array.from({ length: 160 }, (_, i) => i);

  useEffect(() => {
    let frame;
    function animate() {
      if (analyserRef.current && barsRef.current) {
        const data = new Uint8Array(160);
        analyserRef.current.getByteFrequencyData(data);
        const els = barsRef.current.children;
        for (let i = 0; i < 160; i++) {
          const scale = 0.55 + (data[i] / 255) * 1.8;
          els[i].firstChild.style.transform = `scaleY(${scale})`;
        }
      }
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  async function toggle() {
    if (recording) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      analyserRef.current = null;
      setRecording(false);
      if (barsRef.current) {
        Array.from(barsRef.current.children).forEach(el => {
          el.firstChild.style.transform = "";
        });
      }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ac = new AudioContext();
      await ac.resume();
      const analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      ac.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;
      setRecording(true);
    } catch {
      alert("Allow microphone");
    }
  }

  return (
    <div className="visualizer-page">
      <header className="top">
        <div className="search">⌕ Search</div>
        <button className="menu">☰</button>
      </header>

      <div className={`visualizer ${recording ? "active" : ""}`} onClick={toggle}>
        <div className="audio-bars" ref={barsRef}>
          {bars.map((i) => (
            <div className="bar-position" key={i} style={{ transform: `rotate(${(i * 360) / 160}deg)` }}>
              <div className="audio-bar" style={{ animationDelay: `${i * 0.012}s` }} />
            </div>
          ))}
        </div>
        <div className="ring ring-one" />
        <div className="ring ring-two" />
        <button className="center-button">
          <span className={recording ? "recording-dot" : ""} />
        </button>
      </div>

      <p className="recording-text">{recording ? "Recording..." : "Tap lens"}</p>
      <button className="record-button" onClick={toggle}>
        {recording ? "Stop recording" : "Start recording"}
      </button>

      <div className="dots">
        <span className="on"></span><span></span><span></span>
      </div>
    </div>
  );
}.visualizer-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #33b8ff 0%, #0095ff 50%, #0a8eff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
}

.top{
  position:absolute;top:0;left:0;right:0;
  padding:18px 20px;
  display:flex;justify-content:space-between;align-items:center;
  color:white;
}
.search{font-size:19px;font-weight:600;display:flex;gap:8px;align-items:center}
.menu{background:none;border:none;color:white;font-size:28px}

.visualizer {
  position: relative;
  width: min(76vw, 340px);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform .5s ease;
  filter: drop-shadow(0 0 18px rgba(255,255,255,0.8));
}
.visualizer.active { transform: scale(1.04); }

.audio-bars {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: rotate 35s linear infinite;
}
.bar-position {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
}
.audio-bar {
  width: 3px;
  height: 17px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 0 7px white;
  transform-origin: center 170px;
  animation: wave 1.1s ease-in-out infinite alternate;
}

.ring { position: absolute; border-radius: 50%; pointer-events: none; }
.ring-one { width: 76%; height: 76%; border: 2.5px dotted white; animation: rotate 18s linear infinite; }
.ring-two { width: 88%; height: 88%; border: 2.5px dotted rgba(255,255,255,.9); animation: rotate-reverse 24s linear infinite; }

.center-button { width: 45%; height: 45%; border: none; border-radius: 50%; background: transparent; z-index: 2; }
.center-button span { display: block; width: 12px; height: 12px; margin: auto; border-radius: 50%; background: white; opacity: 0; }
.recording-dot { opacity: 1 !important; animation: pulse 1s infinite; }

.recording-text { color: rgba(255,255,255,0.9); font-size: 16px; margin-top: 15px; }
.record-button {
  margin-top: 28px;
  padding: 15px 36px;
  border: none;
  border-radius: 50px;
  background: white;
  color: #0a8eff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.dots{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:12px}
.dots span{width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,0.4)}
.dots span.on{background:white;box-shadow:0 0 10px white}

@keyframes wave { 0%{transform:scaleY(.55);opacity:.65} 100%{transform:scaleY(1.8);opacity:1} }
@keyframes rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes rotate-reverse { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
@keyframes pulse { 0%,100%{transform:scale(1);box-shadow:0 0 10px white} 50%{transform:scale(1.8);box-shadow:0 0 25px white} }
