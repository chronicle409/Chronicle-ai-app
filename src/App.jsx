
import React, { useState, useRef, useEffect } from "react";

export default function App() {
  const [isListening, setIsListening] = useState(false);
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
    } catch (err) {
      setError("Microphone access is needed to listen for music.");
    }
  };

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
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(
            120deg,
            #1598F7,
            #00D4FF,
            #00E5A8,
            #39D353,
            #F5D547,
            #FF8A35,
            #FF3D81,
            #9B45F5,
            #442BFF
          );
          background-size: 500% 500%;
          animation: findoraBackground 25s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: white;
        }

        @keyframes findoraBackground {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .findora-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .findora-center {
          width: min(85vw, 360px);
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

        .findora-ring {
          position: absolute;
          border-radius: 50%;
          transition: all .5s ease;
        }

        .findora-ring.outer {
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,.07);
        }

        .findora-ring.middle {
          width: 72%;
          height: 72%;
          background: rgba(255,255,255,.12);
        }

        .findora-ring.inner {
          width: 48%;
          height: 48%;
          background: rgba(255,255,255,.18);
        }

        .listening .findora-ring {
          animation: findoraPulse 2s ease-in-out infinite;
        }

        .listening .findora-ring.middle {
          animation-delay: .3s;
        }

        .listening .findora-ring.inner {
          animation-delay: .6s;
        }

        @keyframes findoraPulse {
          0%, 100% {
            transform: scale(1);
            opacity: .7;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        .findora-logo {
          position: relative;
          z-index: 2;
          width: 42%;
          height: 42%;
          background: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 5px 30px rgba(0,0,0,.12);
        }

        .findora-logo img {
          width: 75%;
          height: 75%;
          object-fit: contain;
        }

        .findora-listening-info {
          text-align: center;
          margin-top: 20px;
          padding: 0 15px;
          animation: findoraFade .5s ease;
        }

        .findora-audio-lines {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 45px;
          margin-bottom: 20px;
        }

        .findora-audio-lines span {
          width: 6px;
          height: 18px;
          border-radius: 10px;
          animation: findoraBars .7s ease-in-out infinite alternate;
        }

        .findora-audio-lines span:nth-child(1) {
          background: #00E5FF;
          animation-delay: 0s;
        }

        .findora-audio-lines span:nth-child(2) {
          background: #A855F7;
          animation-delay: .12s;
        }

        .findora-audio-lines span:nth-child(3) {
          background: #FF3D81;
          animation-delay: .24s;
        }

        .findora-audio-lines span:nth-child(4) {
          background: #00E5A8;
          animation-delay: .36s;
        }

        .findora-audio-lines span:nth-child(5) {
          background: #FFE14A;
          animation-delay: .48s;
        }

        @keyframes findoraBars {
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
          opacity: .9;
        }

        .findora-error {
          margin-top: 20px;
          font-size: 14px;
          text-align: center;
        }

        .findora-bottom {
          margin-top: 55px;
          display: flex;
          gap: 9px;
        }

        .findora-bottom span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,.6);
        }

        @keyframes findoraFade {
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

      <div className="findora-content">

        <div className={`findora-center ${isListening ? "listening" : ""}`}>

          <div className="findora-ring outer" />
          <div className="findora-ring middle" />
          <div className="findora-ring inner" />

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
              {[1, 2, 3, 4, 5].map(line => (
                <span key={line} />
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
