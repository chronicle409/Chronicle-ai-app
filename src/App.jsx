
import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [error, setError] = useState("");

  const streamRef = useRef(null);
  const neonRef = useRef(null);

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

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is not supported.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      streamRef.current = stream;
      setIsListening(true);
    } catch {
      setError("Please allow microphone access to start listening.");
    }
  };

  // Lightweight audio response.
  // CSS handles the actual animation.
  useEffect(() => {
    if (!isListening || !streamRef.current || !neonRef.current) {
      return;
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    let audioContext;
    let analyser;
    let source;
    let animationFrame;
    let stopped = false;
    let lastUpdate = 0;

    const startAudio = async () => {
      try {
        audioContext = new AudioContextClass();

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        if (stopped) {
          await audioContext.close();
          return;
        }

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.85;

        source = audioContext.createMediaStreamSource(
          streamRef.current
        );

        source.connect(analyser);

        const frequencyData = new Uint8Array(
          analyser.frequencyBinCount
        );

        const update = (now) => {
          if (stopped) return;

          animationFrame = requestAnimationFrame(update);

          // Update only 30 times per second.
          if (now - lastUpdate < 33) return;
          lastUpdate = now;

          analyser.getByteFrequencyData(frequencyData);

          let total = 0;

          for (let i = 0; i < 24; i++) {
            total += frequencyData[i];
          }

          const level = Math.min(
            total / (24 * 255),
            1
          );

          if (neonRef.current) {
            neonRef.current.style.setProperty(
              "--audio-level",
              level.toFixed(3)
            );
          }
        };

        animationFrame = requestAnimationFrame(update);
      } catch {
        if (!stopped) {
          setError("The audio visualizer could not start.");
        }
      }
    };

    startAudio();

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

  // Stop microphone when the app is closed.
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

        html,
        body,
        #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
          background: #000;
        }

        body {
          font-family: Arial, sans-serif;
          overflow: hidden;
        }

        .findora-app {
          width: 100%;
          height: 100vh;
          height: 100svh;
          min-height: 100%;
          position: relative;
          overflow: hidden;
          color: white;
          background: #000;
          isolation: isolate;
        }

        /* TOP NAVIGATION */

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
          font-size: 17px;
          cursor: pointer;
          padding: 5px;
          -webkit-tap-highlight-color: transparent;
        }

        .top-button svg {
          width: 25px;
          height: 25px;
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
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 30px;
          background: rgba(255,255,255,.07);
          color: white;
          font-size: 16px;
          outline: none;
        }

        .findora-search-box input::placeholder {
          color: rgba(255,255,255,.65);
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
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(15,15,20,.97);
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
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 85px 12px 75px;
        }

        .findora-stage {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate3d(0, 0, 0);
          transition:
            transform 850ms cubic-bezier(.22,1,.36,1);
          will-change: transform;
        }

        .findora-stage.listening {
          transform: translate3d(0, -48px, 0);
        }

        /* CENTER CIRCLE */

        .findora-center {
          width: min(86vw, 340px);
          aspect-ratio: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
        }

        /* NEON ANIMATION */

        .findora-neon {
          position: absolute;
          width: 70%;
          height: 70%;
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
          transform: scale(
            calc(1 + var(--audio-level, 0) * .035)
          );
          transition: transform 100ms linear;
          will-change: transform;
        }

        /* Main coloured neon ring */

        .findora-neon::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;

          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 18deg,
            #00eaff 48deg,
            #15bfff 75deg,
            #713cff 120deg,
            #c42bff 160deg,
            transparent 195deg,
            transparent 220deg,
            #00ffc3 255deg,
            #00d9ff 295deg,
            #713cff 330deg,
            transparent 360deg
          );

          -webkit-mask:
            radial-gradient(
              farthest-side,
              transparent calc(100% - 4px),
              #000 calc(100% - 2px)
            );

          mask:
            radial-gradient(
              farthest-side,
              transparent calc(100% - 4px),
              #000 calc(100% - 2px)
            );

          animation: neonRotate 7s linear infinite;
        }

        /* Soft neon glow */

        .findora-neon::after {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 50%;

          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            #00eaff 55deg,
            #853cff 120deg,
            transparent 190deg,
            #00ffc3 270deg,
            #00d9ff 320deg,
            transparent 360deg
          );

          -webkit-mask:
            radial-gradient(
              farthest-side,
              transparent calc(100% - 8px),
              #000 calc(100% - 5px)
            );

          mask:
            radial-gradient(
              farthest-side,
              transparent calc(100% - 8px),
              #000 calc(100% - 5px)
            );

          filter: blur(8px);
          opacity: .85;
          animation: neonRotate 7s linear infinite;
        }

        @keyframes neonRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* Subtle outer circle */

        .findora-orbit {
          position: absolute;
          width: 82%;
          height: 82%;
          border: 1px solid rgba(100,210,255,.12);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        /* INNER LOGO */

        .findora-logo {
          position: relative;
          z-index: 3;
          width: 36%;
          height: 36%;
          border: none;
          border-radius: 50%;
          background: #fff;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;
          padding: 0;

          box-shadow:
            0 0 12px rgba(255,255,255,.12);

          -webkit-tap-highlight-color: transparent;
        }

        .findora-logo img {
          width: 75%;
          height: 75%;
          object-fit: contain;
          display: block;
        }

        .findora-logo:active {
          transform: scale(.96);
        }

        /* LISTENING INFORMATION */

        .findora-listening-info {
          text-align: center;
          margin-top: 38px;
          padding: 0 12px;
          animation: fadeIn .6s ease both;
        }

        .findora-audio-lines {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 35px;
          margin-bottom: 16px;
        }

        .findora-audio-lines span {
          width: 4px;
          height: 15px;
          border-radius: 10px;
          background: linear-gradient(
            to top,
            #00d9ff,
            #9d4dff
          );
          animation: barMotion .7s ease-in-out infinite alternate;
        }

        .findora-audio-lines span:nth-child(2) {
          animation-delay: .12s;
        }

        .findora-audio-lines span:nth-child(3) {
          animation-delay: .24s;
        }

        .findora-audio-lines span:nth-child(4) {
          animation-delay: .36s;
        }

        .findora-audio-lines span:nth-child(5) {
          animation-delay: .48s;
        }

        @keyframes barMotion {
          from {
            transform: scaleY(.5);
          }

          to {
            transform: scaleY(2);
          }
        }

        .findora-listening-info h2 {
          font-size: 23px;
          margin: 0 0 10px;
          font-weight: 600;
        }

        .findora-listening-info p {
          font-size: 14px;
          margin: 0;
          color: rgba(255,255,255,.65);
        }

        /* BOTTOM NAVIGATION */

        .findora-bottom {
          position: absolute;
          bottom: 35px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .findora-bottom span {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: rgba(255,255,255,.28);
        }

        .findora-bottom span:first-child {
          background: white;
          box-shadow: 0 0 9px rgba(255,255,255,.7);
        }

        /* ERROR */

        .findora-error {
          position: absolute;
          bottom: 75px;
          left: 15px;
          right: 15px;
          text-align: center;
          font-size: 14px;
          color: #ff7777;
          padding: 10px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .findora-listening-info h2 {
            font-size: 21px;
          }

          .findora-center {
            width: min(86vw, 320px);
          }
        }

        /* Respect Android battery/accessibility preferences */

        @media (prefers-reduced-motion: reduce) {
          .findora-neon::before,
          .findora-neon::after,
          .findora-audio-lines span {
            animation-duration: 12s;
          }

          .findora-stage {
            transition-duration: 200ms;
          }
        }
      `}</style>

      {/* TOP NAVIGATION */}

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

      {/* SEARCH */}

      {searchOpen && (
        <div className="findora-search-box">
          <input
            placeholder="Search music..."
            autoComplete="off"
          />
        </div>
      )}

      {/* MENU */}

      {menuOpen && (
        <div className="findora-menu">
          <button onClick={() => setMenuOpen(false)}>
            Home
          </button>

          <button onClick={() => setMenuOpen(false)}>
            Settings
          </button>

          <button onClick={() => setMenuOpen(false)}>
            About FINDORA
          </button>
        </div>
      )}

      {/* MAIN VISUALIZER */}

      <div className="findora-content">
        <div
          className={`findora-stage ${
            isListening ? "listening" : ""
          }`}
        >
          <div className="findora-center">

            <div className="findora-orbit" />

            <div
              className="findora-neon"
              ref={neonRef}
            />

            {/* Original FINDORA logo */}

            <button
              className="findora-logo"
              onClick={toggleListening}
              aria-label={
                isListening
                  ? "Stop listening"
                  : "Start listening"
              }
            >
              <img
                src="/findora-logo.png"
                alt="FINDORA"
                draggable="false"
              />
            </button>

          </div>

          {/* LISTENING STATUS */}

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
        </div>

        {/* THREE NAVIGATION DOTS */}

        <div className="findora-bottom">
          <span />
          <span />
          <span />
        </div>
      </div>

      {error && (
        <p className="findora-error">
          {error}
        </p>
      )}

    </main>
  );
}
