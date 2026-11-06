
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true
    });

    if (!ctx) return;

    let animation;
    let elapsed = 0;
    let lastTime = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const COUNT = 180;

    const audioData = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

    const blueColors = [
      "#00D5FF",
      "#00BFFF",
      "#168BFF",
      "#315BFF",
      "#4169E1",
      "#655CFF",
      "#1E90FF"
    ];

    function resize() {
      const rect = canvas.getBoundingClientRect();

      const newWidth = rect.width;
      const newHeight = rect.height;
      const newDpr = Math.min(
        window.devicePixelRatio || 1,
        1.25
      );

      const pixelWidth = Math.round(newWidth * newDpr);
      const pixelHeight = Math.round(newHeight * newDpr);

      if (
        canvas.width === pixelWidth &&
        canvas.height === pixelHeight
      ) {
        return;
      }

      width = newWidth;
      height = newHeight;
      dpr = newDpr;

      canvas.width = pixelWidth;
      canvas.height = pixelHeight;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function drawArc(rotation, color, radius) {
      ctx.beginPath();

      ctx.arc(
        width / 2,
        height / 2,
        radius,
        rotation,
        rotation + 1.45
      );

      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";

      ctx.stroke();
    }

    function draw(timestamp) {
      animation = requestAnimationFrame(draw);

      const delta = lastTime
        ? Math.min((timestamp - lastTime) / 1000, 0.05)
        : 0.016;

      lastTime = timestamp;
      elapsed += delta;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      const radius = Math.min(width, height) * 0.32;

      if (analyser && audioData && listening) {
        analyser.getByteFrequencyData(audioData);
      }

      // 180 BLUE RADIAL BARS

      for (let i = 0; i < COUNT; i++) {
        const angle =
          (i / COUNT) * Math.PI * 2 - Math.PI / 2;

        const audio =
          listening && audioData
            ? audioData[
                Math.floor(
                  (i / COUNT) * audioData.length
                )
              ] / 255
            : 0;

        const wave =
          Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;

        const movement = listening
          ? audio * 35 + wave * 8
          : wave * 7;

        // Smooth blue colour spectrum

        const colorPosition =
          (i / COUNT) * (blueColors.length - 1);

        const colorIndex = Math.floor(colorPosition);

        const color = blueColors[
          Math.min(colorIndex, blueColors.length - 1)
        ];

        ctx.beginPath();

        ctx.moveTo(
          cx + Math.cos(angle) * radius,
          cy + Math.sin(angle) * radius
        );

        ctx.lineTo(
          cx + Math.cos(angle) * (radius + 8 + movement),
          cy + Math.sin(angle) * (radius + 8 + movement)
        );

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        ctx.stroke();
      }

      // THREE INDEPENDENTLY ROTATING BLUE ARCS

      drawArc(
        elapsed * 0.65,
        "#00BFFF",
        radius - 13
      );

      drawArc(
        -elapsed * 0.55 + Math.PI,
        "#4169E1",
        radius - 13
      );

      drawArc(
        elapsed * 0.35 + Math.PI,
        "#655CFF",
        radius - 13
      );
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
      className={`visualizer-button ${
        listening ? "is-listening" : ""
      }`}
      onClick={onToggle}
      aria-label={
        listening ? "Stop listening" : "Start listening"
      }
    >
      <div className="visualizer-container">
        <canvas
          ref={canvasRef}
          className="visualizer-canvas"
        />

        <div className="logo-circle">
          <img
            src="/findora-logo.png"
            alt="FINDORA"
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

  async function stopListening() {
    streamRef.current?.getTracks().forEach(track => {
      track.stop();
    });

    if (audioRef.current) {
      await audioRef.current.close().catch(() => {});
    }

    streamRef.current = null;
    audioRef.current = null;

    setAnalyser(null);
    setListening(false);
  }

  async function toggleListening() {
    if (listening) {
      await stopListening();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const AudioClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioClass) {
        stream.getTracks().forEach(track => track.stop());
        alert("Audio is not supported on this browser.");
        return;
      }

      const audio = new AudioClass();

      await audio.resume();

      const source = audio.createMediaStreamSource(stream);
      const analyserNode = audio.createAnalyser();

      analyserNode.fftSize = 512;
      analyserNode.smoothingTimeConstant = 0.82;

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
      streamRef.current?.getTracks().forEach(track => {
        track.stop();
      });

      audioRef.current?.close();
    };
  }, []);

  return (
    <main className="findora-app">

      <header className="topbar">
        <button
          className="top-icon"
          type="button"
          aria-label="Menu"
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
          type="button"
          aria-label="Search"
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
            type="button"
            className="menu-mic"
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
