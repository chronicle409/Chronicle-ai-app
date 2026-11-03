
import React, { useState, useRef, useEffect } from "react";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");

  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const AudioClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioClass) {
      setError("Audio visualization is not supported.");
      return;
    }

    let audioContext;
    let analyser;
    let source;
    let animationFrame;
    let stopped = false;

    const start = async () => {
      try {
        audioContext = new AudioClass();

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        if (stopped) {
          await audioContext.close();
          return;
        }

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.85;

        source = audioContext.createMediaStreamSource(streamRef.current);
        source.connect(analyser);

        const frequencies = new Uint8Array(analyser.frequencyBinCount);

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = 380 * dpr;
        canvas.height = 380 * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const center = 190;
        const barCount = 120;
        const smoothed = new Array(barCount).fill(0);

        const draw = () => {
          if (stopped) return;

          animationFrame = requestAnimationFrame(draw);

          analyser.getByteFrequencyData(frequencies);

          ctx.clearRect(0, 0, 380, 380);

          for (let i = 0; i < barCount; i++) {
            const angle = (i / barCount) * Math.PI * 2;

            const audioIndex = Math.floor(
              (i / barCount) * frequencies.length * 0.75
            );

            const audioLevel = frequencies[audioIndex] / 255;

            smoothed[i] += (audioLevel - smoothed[i]) * 0.22;

            const organicWave =
              Math.sin(i * 0.13 + performance.now() * 0.0015) * 5;

            const innerRadius = 155;
            const outerRadius =
              165 + smoothed[i] * 48 + organicWave;

            const x1 = center + Math.cos(angle) * innerRadius;
            const y1 = center + Math.sin(angle) * innerRadius;

            const x2 = center + Math.cos(angle) * outerRadius;
            const y2 = center + Math.sin(angle) * outerRadius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);

            ctx.strokeStyle = "rgba(255,255,255,0.95)";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.stroke();
          }
        };

        draw();
      } catch {
        setError("Could not start the audio visualizer.");
      }
    };

    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(animationFrame);

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
          min-height: 100vh;
          min-height: 100svh;
          position: relative;
          overflow: hidden;
          color: white;

          background: linear-gradient(
            120deg,
            #1598F7,
            #00B7FF,
            #287BFF,
            #365DFF,
            #62C5FF,
            #0877E8,
            #1598F7
          );

          background-size: 400% 400%;
          animation: blueFlow 24s ease-in-out infinite;
        }

        @keyframes blueFlow {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 100%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }

        /* TOP BUTTONS */

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
          width: 28px;
          height: 28px;
          stroke: white;
          stroke-width: 2;
          fill: none;
        }

        /* SEARCH */

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

        /* MENU */

        .findora-menu {
          position: absolute;
          top: 90px;
          right: 20px;
          z-index: 15;
          width: 190px;
          padding: 12px;
          border-radius: 16px;
          background: rgba(15,35,100,.9);
          backdrop-filter: blur(15px);
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
          cursor: pointer;
        }

        /* MAIN CONTENT */

        .findora-content {
          min-height: 100vh;
          min-height: 100svh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 15px 85px;
        }

        /* SMOOTH LOGO MOVEMENT */

        .findora-center {
          width: min(82vw, 380px);
          aspect-ratio: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;

          transform: translate3d(0, 0, 0) scale(1);
          transition: transform 1.2s cubic-bezier(.22, 1, .36, 1);
          will-change: transform;
        }

        .findora-center.listening {
          transform: translate3d(0, -95px, 0) scale(.96);
        }

        /* CIRCULAR RINGS */

        .findora-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .findora-ring.outer {
          width: 100%;
          height: 100%;
          border: 2px solid rgba(255,255,255,.17);
        }

        .findora-ring.middle {
          width: 75%;
          height: 75%;
          border: 2px solid rgba(255,255,255,.23);
        }

        .findora-ring.inner {
          width: 53%;
          height: 53%;
          border: 2px solid rgba(255,255,255,.32);
        }

        .findora-center.listening .findora-ring {
          animation: ringPulse 2.5s ease-in-out infinite;
        }

        .findora-center.listening .findora-ring.middle {
          animation-delay: .3s;
        }

        .findora-center.listening .findora-ring.inner {
          animation-delay: .6s;
        }

        @keyframes ringPulse {
          0%, 100% {
            transform: scale(1);
            opacity: .5;
          }

          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }

        /* AUDIO VISUALIZER */

        .findora-visualizer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        /* LOGO BUTTON */

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
          box-shadow: 0 0 25px rgba(255,255,255,.2);
          -webkit-tap-highlight-color: transparent;
        }

        .findora-logo img {
          width: 75%;
          height: 75%;
          object-fit: contain;
        }

        /* LISTENING TEXT */

        .findora-listening-info {
          text-align: center;
          margin-top: 25px;
          padding: 0 12px;
          animation: fadeIn .7s ease both;
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
          background: #00D4FF;
        }

        .findora-audio-lines span:nth-child(2) {
          background: #438BFF;
          animation-delay: .12s;
        }

        .findora-audio-lines span:nth-child(3) {
          background: #758CFF;
          animation-delay: .24s;
        }

        .findora-audio-lines span:nth-child(4) {
          background: #A5CFFF;
          animation-delay: .36s;
        }

        .findora-audio-lines span:nth-child(5) {
          background: white;
          animation-delay: .48s;
        }

        @keyframes barMotion {
          from { transform: scaleY(.5); }
          to { transform: scaleY(2.5); }
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

        .findora-error {
          text-align: center;
          font-size: 14px;
          padding: 10px;
        }

        /* BOTTOM DOTS */

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
          box-shadow: 0 0 12px white;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .findora-listening-info h2 {
            font-size: 23px;
          }

          .findora-listening-info p {
            font-size: 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .findora-app {
            animation: none;
          }

          .findora-center {
            transition-duration: .3s;
          }
        }
      `}</style>

      {/* HEADER */}

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

      {/* SEARCH PANEL */}

      {searchOpen && (
        <div className="findora-search-box">
          <input
            placeholder="Search music..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
      )}

      {/* MENU PANEL */}

      {menuOpen && (
        <div className="findora-menu">
          <button onClick={() => setMenuOpen(false)}>Home</button>
          <button onClick={() => setMenuOpen(false)}>Settings</button>
          <button onClick={() => setMenuOpen(false)}>About FINDORA</button>
        </div>
      )}

      {/* MAIN SCREEN */}

      <div className="findora-content">

        <div className={`findora-center ${isListening ? "listening" : ""}`}>

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

            <p>
              Make sure your device can hear the song clearly
            </p>

          </div>
        )}

        {error && (
          <p className="findora-error">{error}</p>
        )}

        <div className="findora-bottom">
          <span />
          <span />
          <span />
        </div>

      </div>
    </main>
  );
}
