
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function RadialVisualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let frame;
    let elapsed = 0;
    let lastFrame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const COUNT = 180;
    const data = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

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

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.315;

      if (analyser && data && listening) {
        analyser.getByteFrequencyData(data);
      }

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;

        const audio =
          listening && data
            ? data[Math.floor((i / COUNT) * data.length)] / 255
            : 0;

        const wave =
          Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;

        const movement = listening
          ? audio * 17 + wave * 4
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
        ctx.shadowBlur = 7;
        ctx.shadowColor = color;
        ctx.stroke();
      }

      const drawArc = (rotation, color) => {
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
    <button
      className="visualizer-trigger"
      onClick={onToggle}
      aria-label={listening ? "Stop listening" : "Start listening"}
      type="button"
    >
      <div className="findora-visualizer">
        <canvas
          ref={canvasRef}
          className="findora-wave"
        />

        <div className="findora-logo-circle">
          <img
            src="/findora-logo.png"
            alt="FINDORA"
            draggable="false"
          />
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

  const toggleListening = async () => {
    if (listening) {
      streamRef.current?.getTracks().forEach((track) => track.stop());

      await audioRef.current?.close();

      streamRef.current = null;
      audioRef.current = null;

      setAnalyser(null);
      setListening(false);

      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      const audio = new AudioContextClass();

      const source = audio.createMediaStreamSource(stream);
      const analyserNode = audio.createAnalyser();

      analyserNode.fftSize = 512;

      source.connect(analyserNode);

      streamRef.current = stream;
      audioRef.current = audio;

      setAnalyser(analyserNode);
      setListening(true);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());

      alert("Please allow microphone access to use FINDORA.");
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioRef.current?.close();
    };
  }, []);

  return (
    <main className="findora-app">

      {/* TOP ICONS */}

      <header className="findora-topbar">

        <div className="topbar-spacer" />

        <div className="topbar-actions">

          <button
            className="icon-button"
            onClick={() => {
              setMenuOpen(!menuOpen);
              setSearchOpen(false);
            }}
            aria-label="Menu"
            type="button"
          >
            <svg viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            className="icon-button"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setMenuOpen(false);
            }}
            aria-label="Search"
            type="button"
          >
            <svg viewBox="0 0 24 24">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
          </button>

        </div>

      </header>

      {/* ICON-ONLY MENU */}

      {menuOpen && (
        <nav className="findora-menu">

          <button
            className="menu-icon-action"
            onClick={toggleListening}
            aria-label={listening ? "Stop listening" : "Start listening"}
            type="button"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3m-4 0h8" />
            </svg>
          </button>

        </nav>
      )}

      {/* SEARCH */}

      {searchOpen && (
        <form
          className="findora-search"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            aria-label="Search songs and artists"
            autoFocus
          />

          <button type="submit" aria-label="Submit search">
            <svg viewBox="0 0 24 24">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
          </button>
        </form>
      )}

      {/* MAIN VISUALIZER */}

      <section className="findora-main">

        <RadialVisualizer
          analyser={analyser}
          listening={listening}
          onToggle={toggleListening}
        />

      </section>

    </main>
  );
}
