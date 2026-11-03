
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    // Prepare bar positions and colours only once.
    const bars = Array.from({ length: COUNT }, (_, i) => ({
      angle: (i / COUNT) * Math.PI * 2 - Math.PI / 2,
      hue: (345 + (i / COUNT) * 45) % 360,
    }));

    function resize() {
      const rect = canvas.getBoundingClientRect();

      const newWidth = rect.width;
      const newHeight = rect.height;

      if (
        width === newWidth &&
        height === newHeight
      ) {
        return;
      }

      width = newWidth;
      height = newHeight;

      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    if (analyser) {
      analyser.smoothingTimeConstant = 0.82;
    }

    function drawArc(cx, cy, radius, rotation, color) {
      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        radius,
        rotation,
        rotation + 1.45
      );

      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";

      // Glow is reserved for the three arcs,
      // rather than all 180 bars.
      ctx.shadowBlur = 13;
      ctx.shadowColor = color;

      ctx.stroke();
    }

    function draw(timestamp) {
      animation = requestAnimationFrame(draw);

      // Limit unnecessary rendering work.
      if (timestamp - lastFrame < 16) return;

      const delta = lastFrame
        ? Math.min((timestamp - lastFrame) / 1000, 0.05)
        : 0;

      lastFrame = timestamp;
      elapsed += delta;

      if (!width || !height) return;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      const radius = Math.min(width, height) * 0.32;

      if (analyser && audioData && listening) {
        analyser.getByteFrequencyData(audioData);
      }

      // Reset expensive shadow effects before drawing bars.
      ctx.shadowBlur = 0;

      // Draw the 180 red radial bars.
      for (let i = 0; i < COUNT; i++) {
        const bar = bars[i];

        const audio = listening && audioData
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

        const startRadius = radius;
        const endRadius = radius + 8 + movement;

        const cos = Math.cos(bar.angle);
        const sin = Math.sin(bar.angle);

        ctx.beginPath();

        ctx.moveTo(
          cx + cos * startRadius,
          cy + sin * startRadius
        );

        ctx.lineTo(
          cx + cos * endRadius,
          cy + sin * endRadius
        );

        ctx.strokeStyle = `hsl(${bar.hue}, 100%, 62%)`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        ctx.stroke();
      }

      // Draw three smoothly rotating red arcs.
      drawArc(
        cx,
        cy,
        radius - 13,
        elapsed * 0.65,
        "#ff1744"
      );

      drawArc(
        cx,
        cy,
        radius - 13,
        -elapsed * 0.55 + Math.PI,
        "#ff4d6d"
      );

      drawArc(
        cx,
        cy,
        radius - 13,
        elapsed * 0.35 + Math.PI,
        "#d50000"
      );

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
      aria-pressed={listening}
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
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Microphone access is not supported on this browser.");
        return;
      }

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
      console.error("FINDORA microphone error:", error);

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

        <div
          className={`display-content ${
            listening ? "is-listening" : ""
          }`}
        >

          <Visualizer
            analyser={analyser}
            listening={listening}
            onToggle={toggleListening}
          />

          {listening && (
            <div className="listening-information">

              <h1>Listening for music</h1>

              <p>
                Make sure your device can hear the song clearly
              </p>

              <div
                className="small-audio-animation"
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}
