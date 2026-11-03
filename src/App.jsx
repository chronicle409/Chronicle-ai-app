
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animation;
    let elapsed = 0;
    let lastFrame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const COUNT = 180;
    const audioData = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function draw(timestamp) {
      animation = requestAnimationFrame(draw);

      if (timestamp - lastFrame < 33) return;
      lastFrame = timestamp;
      elapsed += 0.033;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.36;

      if (analyser && audioData && listening) {
        analyser.getByteFrequencyData(audioData);
      }

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;

        const audio =
          listening && audioData
            ? audioData[Math.floor((i / COUNT) * audioData.length)] / 255
            : 0;

        const wave =
          Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;

        const movement = listening
          ? audio * 16 + wave * 4
          : wave * 3;

        const hue = 185 + (i / COUNT) * 100;
        const color = `hsl(${hue}, 100%, 66%)`;

        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(angle) * radius,
          cy + Math.sin(angle) * radius
        );
        ctx.lineTo(
          cx + Math.cos(angle) * (radius + 4 + movement),
          cy + Math.sin(angle) * (radius + 4 + movement)
        );

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.stroke();
      }

      function arc(rotation, color) {
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          radius - 10,
          rotation,
          rotation + 0.95
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
      }

      arc(elapsed * 0.75, "#a43dff");
      arc(-elapsed * 0.65 + Math.PI, "#20dfff");

      ctx.shadowBlur = 0;
    }

    animation = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animation);
      observer.disconnect();
    };
  }, [analyser, listening]);

  return (
    <button
      type="button"
      className="visualizer-button"
      onClick={onToggle}
      aria-label={listening ? "Stop listening" : "Start listening"}
    >
      <div className="visualizer-container">
        <canvas ref={canvasRef} className="visualizer-canvas" />

        <div className="logo-circle">
          <img src="/findora-logo.png" alt="FINDORA" />
        </div>
      </div>
    </button>
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

  async function toggleListening() {
    if (listening) {
      streamRef.current?.getTracks().forEach(track => track.stop());

      if (audioRef.current) {
        await audioRef.current.close().catch(() => {});
      }

      streamRef.current = null;
      audioRef.current = null;
      setAnalyser(null);
      setListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const AudioClass =
        window.AudioContext || window.webkitAudioContext;

      const audio = new AudioClass();
      await audio.resume();

      const source = audio.createMediaStreamSource(stream);
      const analyserNode = audio.createAnalyser();

      analyserNode.fftSize = 512;
      source.connect(analyserNode);

      streamRef.current = stream;
      audioRef.current = audio;

      setAnalyser(analyserNode);
      setListening(true);
    } catch (error) {
      alert("Please allow microphone access for FINDORA.");
    }
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioRef.current?.close();
    };
  }, []);

  return (
    <main className="findora-app">

      <header className="topbar">

        <button
          className="top-icon"
          aria-label="Menu"
          type="button"
          onClick={() => {
            setMenuOpen(!menuOpen);
            setSearchOpen(false);
          }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          className="top-icon"
          aria-label="Search"
          type="button"
          onClick={() => {
            setSearchOpen(!searchOpen);
            setMenuOpen(false);
          }}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 5 5" />
          </svg>
        </button>

      </header>

      {menuOpen && (
        <div className="menu-panel">
          <button
            className="menu-mic"
            type="button"
            aria-label="Toggle microphone"
            onClick={() => {
              setMenuOpen(false);
              toggleListening();
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3m-4 0h8" />
            </svg>
          </button>
        </div>
      )}

      {searchOpen && (
        <form
          className="search-panel"
          onSubmit={event => event.preventDefault()}
        >
          <input
            type="search"
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
            aria-label="Search"
            autoFocus
          />
        </form>
      )}

      <section className="main-display">
        <Visualizer
          analyser={analyser}
          listening={listening}
          onToggle={toggleListening}
        />
      </section>

    </main>
  );
}
