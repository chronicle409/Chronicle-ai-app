import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function RadialVisualizer({ analyser, listening }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame, elapsed = 0, lastFrame = 0;
    let width = 0, height = 0, dpr = 1;
    const COUNT = 180;
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = (timestamp) => {
      frame = requestAnimationFrame(draw);
      if (timestamp - lastFrame < 33) return;
      lastFrame = timestamp;
      elapsed += 0.033;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2, cy = height / 2;
      const radius = Math.min(width, height) * 0.315;

      if (analyser && data && listening) analyser.getByteFrequencyData(data);

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;
        const audio = listening && data
          ? data[Math.floor((i / COUNT) * data.length)] / 255 : 0;
        const wave = Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;
        const movement = listening ? audio * 17 + wave * 4 : wave * 3;
        const hue = 185 + (i / COUNT) * 100;
        const color = `hsl(${hue}, 100%, 66%)`;

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.lineTo(
          cx + Math.cos(angle) * (radius + 4 + movement),
          cy + Math.sin(angle) * (radius + 4 + movement)
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 7;
        ctx.shadowColor = color;
        ctx.stroke();
      }

      const drawArc = (rotation, color) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 10, rotation, rotation + 0.95);
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
      };

      drawArc(elapsed * 0.75, "#a43dff");
      drawArc(-elapsed * 0.65 + Math.PI, "#20dfff");
      ctx.shadowBlur = 0;
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [analyser, listening]);

  return (
    <div className="findora-visualizer">
      <canvas ref={canvasRef} className="findora-wave" />
      <div className="findora-logo-circle">
        <img src="/findora-logo.png" alt="FINDORA" />
      </div>
    </div>
  );
}

export default function App() {
  const [listening, setListening] = useState(false);
  const [analyser, setAnalyser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const audioRef = useRef(null);
  const streamRef = useRef(null);

  const toggleListening = async () => {
    if (listening) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      await audioRef.current?.close();
      streamRef.current = null;
      audioRef.current = null;
      setAnalyser(null);
      setListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audio = new AudioContext();
      const source = audio.createMediaStreamSource(stream);
      const analyserNode = audio.createAnalyser();
      analyserNode.fftSize = 512;
      source.connect(analyserNode);
      streamRef.current = stream;
      audioRef.current = audio;
      setAnalyser(analyserNode);
      setListening(true);
    } catch {
      alert("Please allow microphone access to use FINDORA.");
    }
  };

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioRef.current?.close();
  }, []);

  return (
    <main className="findora-app">
      <header className="findora-topbar">
        <button className="icon-button" onClick={() => {
          setMenuOpen(!menuOpen);
          setSearchOpen(false);
        }} aria-label="Open menu">
          ☰
        </button>

        <div className="findora-brand">FINDORA<span>.</span></div>

        <button className="icon-button" onClick={() => {
          setSearchOpen(!searchOpen);
          setMenuOpen(false);
        }} aria-label="Search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 5 5" />
          </svg>
        </button>
      </header>

      {menuOpen && (
        <nav className="findora-menu">
          <button onClick={() => setMenuOpen(false)}>Home</button>
          <button onClick={() => { setMenuOpen(false); setSearchOpen(true); }}>Search music</button>
          <button onClick={() => setMenuOpen(false)}>About FINDORA</button>
        </nav>
      )}

      {searchOpen && (
        <form className="findora-search" onSubmit={e => e.preventDefault()}>
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search for a song or artist..."
          />
          <button type="submit">Search</button>
        </form>
      )}

      <section className="findora-main">
        <p className="findora-status">
          {listening ? "LISTENING TO AUDIO" : "READY TO DISCOVER"}
        </p>

        <RadialVisualizer analyser={analyser} listening={listening} />

        <h2>{listening ? "Listening..." : "Discover any song"}</h2>
        <p className="findora-description">
          {listening
            ? "Let FINDORA hear the music around you."
            : "Tap the button and let the music play."}
        </p>

        <button
          className={listening ? "findora-button active" : "findora-button"}
          onClick={toggleListening}
        >
          {listening ? "STOP LISTENING" : "START LISTENING"}
        </button>
      </section>

      <footer>FINDORA AI · DISCOVER YOUR SOUND</footer>
    </main>
  );
  }
