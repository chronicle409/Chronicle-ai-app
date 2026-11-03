
import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const toggleListening = async () => {
    if (isListening) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsListening(false);
      setError("");
      return;
    }

    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      streamRef.current = stream;
      setIsListening(true);
    } catch {
      setError("Please allow microphone access to start listening.");
    }
  };

  useEffect(() => {
    if (!isListening || !canvasRef.current || !streamRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    let audioContext;
    let source;
    let analyser;
    let frame;
    let stopped = false;
    let lastDraw = 0;

    const count = 84;
    const size = 320;
    const smooth = new Float32Array(count);
    const colors = Array.from({ length: count }, (_, i) =>
      `hsl(${190 + (i / count) * 95}, 100%, 82%)`
    );

    canvas.width = size;
    canvas.height = size;

    const cx = size / 2;
    const cy = size / 2;

    const startAudio = async () => {
      try {
        audioContext = new AudioContextClass();

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        if (stopped) return;

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.9;

        source = audioContext.createMediaStreamSource(streamRef.current);
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        const draw = (now) => {
          if (stopped) return;

          frame = requestAnimationFrame(draw);

          // Draw only 25 times per second
          if (now - lastDraw < 40) return;
          lastDraw = now;

          analyser.getByteFrequencyData(data);
          ctx.clearRect(0, 0, size, size);

          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const index = Math.floor(
              (i / count) * data.length * 0.85
            );

            const level = data[index] / 255;
            smooth[i] += (level - smooth[i]) * 0.14;

            const inner = 119;
            const length = 5 + smooth[i] * 24;
            const outer = inner + length;

            const x1 = cx + Math.cos(angle) * inner;
            const y1 = cy + Math.sin(angle) * inner;
            const x2 = cx + Math.cos(angle) * outer;
            const y2 = cy + Math.sin(angle) * outer;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.stroke();
          }

          // Thin outer ring
          ctx.beginPath();
          ctx.arc(cx, cy, 139, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(210,235,255,0.35)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        };

        frame = requestAnimationFrame(draw);
      } catch {
        setError("The audio visualizer could not start.");
      }
    };

    startAudio();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);

      try {
        source?.disconnect();
        if (audioContext && audioContext.state !== "closed") {
          audioContext.close();
        }
      } catch {}
    };
  }, [isListening]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <main className="findora-app">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, sans-serif;
        }

        .findora-app {
          width: 100%;
          height: 100vh;
          height: 100svh;
          position: relative;
          overflow: hidden;
          color: white;
          background: linear-gradient(135deg, #079ff0, #287bff, #087fe9);
        }

        .findora-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
          padding: 28px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .top-button {
          display: flex;
          align-items: center;
          gap: 9px;
          background: transparent;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 5px;
        }

        .top-button svg {
          width: 29px;
          height: 29px;
          stroke: white;
          stroke-width: 2;
          fill: none;
        }

        .findora-search-box {
          position: absolute;
          top: 90px;
          left: 20px;
          right: 20px;
          z-index: 12;
        }

        .findora-search-box input {
          width: 100%;
          padding: 14px 18px;
          border: 1px solid rgba(255,255,255,.3);
          border-radius: 30px;
          background: rgba(255,255,255,.16);
          color: white;
          font-size: 16px;
          outline: none;
        }

        .findora-search-box input::placeholder {
          color: white;
        }

        .findora-menu {
          position: absolute;
          top: 90px;
          right: 20px;
          z-index: 15;
          width: 190px;
          padding: 12px;
          border-radius: 16px;
          background: rgba(15,35,100,.94);
        }

        .findora-menu button {
          display: block;
          width: 100%;
          padding: 14px;
          color: white;
          background: transparent;
          border: none;
          text-align: left;
          font-size: 15px;
        }

        .findora-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 90px 12px 75px;
        }

        .findora-stage {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translateY(0);
          transition: transform 1s cubic-bezier(.22,1,.36,1);
          will-change: transform;
        }

        .findora-stage.listening {
          transform: translateY(-48px);
        }

        .findora-center {
          width: min(88vw, 360px);
          aspect-ratio: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .findora-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .findora-ring.outer {
          width: 83%;
          height: 83%;
          border: 2px solid rgba(255,255,255,.18);
        }

        .findora-ring.middle {
          width: 65%;
          height: 65%;
          border: 2px solid rgba(255,255,255,.24);
        }

        .findora-ring.inner {
          width: 48%;
          height: 48%;
          border: 2px solid rgba(255,255,255,.3);
        }

        .findora-visualizer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        .findora-logo {
          position: relative;
          z-index: 3;
          width: 43%;
          height: 43%;
          border: none;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        .findora-logo img {
          width: 75%;
          height: 75%;
          object-fit: contain;
        }

        .findora-listening-info {
          text-align: center;
          margin-top: 42px;
          padding: 0 12px;
          animation: fadeIn .6s ease both;
        }

        .findora-audio-lines {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 42px;
          margin-bottom: 18px;
        }

        .findora-audio-lines span {
          width: 6px;
          height: 18px;
          border-radius: 10px;
          animation: barMotion .7s ease-in-out infinite alternate;
        }

        .findora-audio-lines span:nth-child(1) {
          background: #00d4ff;
        }

        .findora-audio-lines span:nth-child(2) {
          background: #438bff;
          animation-delay: .12s;
        }

        .findora-audio-lines span:nth-child(3) {
          background: #758cff;
          animation-delay: .24s;
        }

        .findora-audio-lines span:nth-child(4) {
          background: #a5cfff;
          animation-delay: .36s;
        }

        .findora-audio-lines span:nth-child(5) {
          background: white;
          animation-delay: .48s;
        }

        @keyframes barMotion {
          from { transform: scaleY(.5); }
          to { transform: scaleY(2.2); }
        }

        .findora-listening-info h2 {
          font-size: 25px;
          margin: 0 0 10px;
          font-weight: 700;
        }

        .findora-listening-info p {
          font-size: 15px;
          margin: 0;
        }

        .findora-bottom {
          position: absolute;
          bottom: 35px;
          display: flex;
          gap: 15px;
        }

        .findora-bottom span {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: rgba(255,255,255,.35);
        }

        .findora-bottom span:first-child {
          background: white;
          box-shadow: 0 0 10px white;
        }

        .findora-error {
          position: absolute;
          bottom: 75px;
          text-align: center;
          font-size: 14px;
          padding: 10px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .findora-listening-info h2 {
            font-size: 23px;
          }

          .findora-listening-info p {
            font-size: 14px;
          }
        }
      `}</style>

      <header className="findora-top">
        <button
          className="top-button"
          onClick={() => {
            setSearchOpen(!searchOpen);
            setMenuOpen(false);
          }}
          aria-label="Search"
        >
          <svg viewBox="0 0 24 24">
            <circle cx="10.8" cy="10.8" r="7.2" />
            <path d="m16 16 5 5" />
          </svg>
          <span>Search</span>
        </button>

        <button
          className="top-button"
          onClick={() => {
            setMenuOpen(!menuOpen);
            setSearchOpen(false);
          }}
          aria-label="Menu"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </header>

      {searchOpen && (
        <div className="findora-search-box">
          <input placeholder="Search music..." />
        </div>
      )}

      {menuOpen && (
        <div className="findora-menu">
          <button onClick={() => setMenuOpen(false)}>Home</button>
          <button onClick={() => setMenuOpen(false)}>Settings</button>
          <button onClick={() => setMenuOpen(false)}>About FINDORA</button>
        </div>
      )}

      <div className="findora-content">
        <div className={`findora-stage ${isListening ? "listening" : ""}`}>
          <div className="findora-center">
            <div className="findora-ring outer" />
            <div className="findora-ring middle" />
            <div className="findora-ring inner" />

            <canvas
              ref={canvasRef}
              className="findora-visualizer"
            />

            <button
              className="findora-logo"
              onClick={toggleListening}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              <img src="/findora-logo.png" alt="FINDORA" />
            </button>
          </div>

          {isListening && (
            <div className="findora-listening-info">
              <div className="findora-audio-lines">
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n} />
                ))}
              </div>

              <h2>Listening for music</h2>
              <p>Make sure your device can hear the song clearly</p>
            </div>
          )}
        </div>

        <div className="findora-bottom">
          <span />
          <span />
          <span />
        </div>
      </div>

      {error && <p className="findora-error">{error}</p>}
    </main>
  );
}
