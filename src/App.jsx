
import React, { useState, useRef, useEffect } from "react";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");

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
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const bars = Array.from({ length: 180 }, (_, i) => i);

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
          min-height: 100vh;
          width: 100%;
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
          animation: blueFlow 22s ease-in-out infinite;
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
          justify-content: center;
          gap: 9px;
          background: transparent;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 5px;
        }

        .top-button svg {
          width: 27px;
          height: 27px;
          stroke: white;
          stroke-width: 2;
          fill: none;
        }

        .search-label {
          font-size: 22px;
          color: white;
        }

        /* SEARCH */

        .findora-search-box {
          position: absolute;
          top: 85px;
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
          top: 85px;
          right: 20px;
          z-index: 15;
          width: 190px;
          padding: 12px;
          border-radius: 16px;
          background: rgba(15,35,100,.9);
          backdrop-filter: blur(15px);
          box-shadow: 0 8px 30px rgba(0,0,0,.2);
        }

        .findora-menu button {
          display: block;
          width: 100%;
          padding: 13px;
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
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 90px 15px 75px;
        }

        /* CENTRAL LOGO */

        .findora-center {
          width: min(82vw, 380px);
          aspect-ratio: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform .6s ease;
        }

        .findora-center.listening {
          transform: translateY(-45px);
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
          border: 2px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.035);
        }

        .findora-ring.middle {
          width: 75%;
          height: 75%;
          border: 2px solid rgba(255,255,255,.2);
          background: rgba(255,255,255,.045);
        }

        .findora-ring.inner {
          width: 53%;
          height: 53%;
          border: 2px solid rgba(255,255,255,.3);
          background: rgba(255,255,255,.08);
        }

        .findora-center.listening .findora-ring {
          animation: ringPulse 2s ease-in-out infinite;
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
          }
          50% {
            transform: scale(1.055);
          }
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
        }

        .findora-logo img {
          width: 75%;
          height: 75%;
          object-fit: contain;
        }

        /* CIRCULAR AUDIO VISUALIZER */

        .findora-visualizer {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          overflow: visible;
        }

        .findora-visualizer line {
          stroke: rgba(255,255,255,.95);
          stroke-width: 2;
          stroke-linecap: round;
          transform-box: view-box;
          transform-origin: 190px 190px;
        }

        .findora-center.listening .findora-visualizer line {
          animation: radialMotion .7s ease-in-out infinite alternate;
        }

        @keyframes radialMotion {
          from {
            transform: scaleY(.65);
            opacity: .55;
          }
          to {
            transform: scaleY(1.8);
            opacity: 1;
          }
        }

        /* LISTENING TEXT */

        .findora-listening-info {
          text-align: center;
          margin-top: 25px;
          padding: 0 12px;
          animation: fadeIn .5s ease;
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
        }

        .findora-audio-lines span:nth-child(1) {
          background: #00D4FF;
          animation-delay: 0s;
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

        .findora-center.listening ~ .findora-listening-info
        .findora-audio-lines span {
          animation: barMotion .65s ease-in-out infinite alternate;
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
      `}</style>

      {/* TOP HEADER */}

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
            <circle cx="10.8" cy="10.8" r="7.2"/>
            <path d="m16 16 5 5"/>
          </svg>

          <span className="search-label">Search</span>
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
            <path d="M3 6h18M3 12h18M3 18h18"/>
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

      {/* MAIN FINDORA SCREEN */}

      <div className="findora-content">

        <div className={`findora-center ${isListening ? "listening" : ""}`}>

          <div className="findora-ring outer" />
          <div className="findora-ring middle" />
          <div className="findora-ring inner" />

          <svg
            className="findora-visualizer"
            viewBox="0 0 380 380"
          >
            {bars.map(i => {
              const angle = (i * 360) / bars.length;
              const delay = (i % 20) * .025;

              return (
                <line
                  key={i}
                  x1="190"
                  y1="12"
                  x2="190"
                  y2="24"
                  transform={`rotate(${angle} 190 190)`}
                  style={{ animationDelay: `${delay}s` }}
                />
              );
            })}
          </svg>

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
