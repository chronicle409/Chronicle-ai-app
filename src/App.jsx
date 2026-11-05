
import { useState } from "react";
import "./App.css";

let findoraAudio = null;

function playFindoraSound(type = "on") {
  const soundFile =
    type === "off"
      ? "/findora-off-clean.mp3"
      : "/findora-on-fixed.mp3";

  if (findoraAudio) {
    findoraAudio.pause();
    findoraAudio.currentTime = 0;
  }

  findoraAudio = new Audio(soundFile);
  findoraAudio.play().catch(console.error);
}

function ChronicleLogo() {
  return (
    <div className="voice-circle">
      <svg viewBox="0 0 120 60">
        <path
          d="M5 30 L20 30 L29 19 L38 43 L48 9 L59 52 L69 16 L80 39 L89 25 L99 30 L115 30"
          fill="none"
          stroke="#ed174c"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function MiniWave() {
  return (
    <svg viewBox="0 0 38 30" className="mini-wave">
      <path
        d="M1 15 H5 L9 8 L13 22 L17 3 L21 27 L25 8 L29 17 L33 12 L37 15"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ListeningAnimation() {
  const particles = Array.from({ length: 180 }, (_, i) => {
    const angle = (i * 360) / 180;

    const variation =
      Math.sin(i * 0.41) * 3 +
      Math.cos(i * 0.17) * 2;

    const radius = 57 + variation;

    const length =
      2 +
      Math.abs(Math.sin(i * 0.31)) * 5 +
      Math.abs(Math.cos(i * 0.13)) * 3;

    return {
      angle,
      radius,
      length,
      delay: `${(i % 25) * -0.09}s`
    };
  });

  return (
    <div className="findora-animation">

      <svg
        className="findora-visualizer"
        viewBox="0 0 320 320"
      >
        <defs>
          <linearGradient
            id="findoraRedGradient"
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#7a001e" />
            <stop offset="25%" stopColor="#ff1744" />
            <stop offset="50%" stopColor="#ff5577" />
            <stop offset="75%" stopColor="#ed174c" />
            <stop offset="100%" stopColor="#8b0030" />
          </linearGradient>

          <filter id="findoraRedGlow">
            <feGaussianBlur
              stdDeviation="3"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glowing circular audio particles */}

        <g filter="url(#findoraRedGlow)">
          {particles.map((p, i) => (
            <line
              key={i}
              className="findora-particle"
              x1="160"
              y1={160 - p.radius}
              x2="160"
              y2={160 - p.radius - p.length}
              transform={`rotate(${p.angle} 160 160)`}
              stroke="url(#findoraRedGradient)"
              strokeWidth={i % 3 === 0 ? 1.8 : 1.2}
              strokeLinecap="round"
              style={{
                animationDelay: p.delay
              }}
            />
          ))}
        </g>

        {/* Glowing circular base */}

        <circle
          cx="160"
          cy="160"
          r="57"
          fill="none"
          stroke="url(#findoraRedGradient)"
          strokeWidth="2"
          opacity="0.8"
          filter="url(#findoraRedGlow)"
          className="findora-base-ring"
        />

        {/* Moving red energy particles */}

        <g className="findora-energy">
          {Array.from({ length: 36 }, (_, i) => (
            <circle
              key={i}
              cx="160"
              cy="103"
              r={i % 4 === 0 ? 1.8 : 1}
              fill="#ff315e"
              opacity="0.9"
              transform={`rotate(${i * 10} 160 160)`}
            />
          ))}
        </g>

      </svg>

      <div className="findora-listening-text">
        <h3>Listening for music</h3>

        <p>
          Make sure your device can hear the song
          <br />
          clearly
        </p>

        <div className="bottom-audio-bars">
          {[8, 14, 20, 12, 17].map((height, i) => (
            <span
              key={i}
              style={{
                height: `${height}px`,
                animationDelay: `${i * 0.12}s`
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

export default function App() {
  const [listening, setListening] = useState(false);

  function handleVoiceClick() {
    if (listening) {
      playFindoraSound("off");
      setListening(false);
    } else {
      playFindoraSound("on");
      setListening(true);
    }
  }

  return (
    <main
      className={`chronicle-app ${
        listening ? "is-listening" : ""
      }`}
    >

      <style>{`

        .chronicle-app .findora-animation {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-top: 5px;
        }

        .chronicle-app .findora-visualizer {
          width: min(76vw, 260px);
          height: auto;
          overflow: visible;
        }

        .findora-particle {
          transform-box: view-box;
          transform-origin: 160px 160px;
          animation: findoraParticle
            0.75s ease-in-out infinite alternate;
        }

        @keyframes findoraParticle {
          0% {
            opacity: 0.35;
            stroke-width: 0.8px;
          }

          100% {
            opacity: 1;
            stroke-width: 2.2px;
          }
        }

        .findora-base-ring {
          animation: findoraRingPulse
            1.8s ease-in-out infinite;
          transform-origin: 160px 160px;
        }

        @keyframes findoraRingPulse {
          0%, 100% {
            opacity: 0.55;
            stroke-width: 1.5px;
          }

          50% {
            opacity: 1;
            stroke-width: 2.5px;
          }
        }

        .findora-energy {
          transform-origin: 160px 160px;
          animation: findoraEnergyRotate
            9s linear infinite;
        }

        @keyframes findoraEnergyRotate {
          to {
            transform: rotate(360deg);
          }
        }

        .chronicle-app .findora-listening-text {
          color: white;
          text-align: center;
          margin-top: 0;
        }

        .findora-listening-text h3 {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .findora-listening-text p {
          font-size: 9px;
          line-height: 1.5;
          margin: 0;
          color: #eeeeee;
        }

        .bottom-audio-bars {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 25px;
          margin-top: 15px;
        }

        .bottom-audio-bars span {
          width: 3px;
          border-radius: 5px;
          background: #ff315e;
          animation: bottomBarPulse
            0.7s ease-in-out infinite alternate;
        }

        @keyframes bottomBarPulse {
          from {
            transform: scaleY(0.4);
          }

          to {
            transform: scaleY(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .findora-particle,
          .findora-base-ring,
          .findora-energy,
          .bottom-audio-bars span {
            animation-duration: 8s;
          }
        }

      `}</style>

      <header className="chronicle-header">
        <button className="header-button">☰</button>
        <button className="header-button">☏</button>
      </header>

      <section className="visualizer-container">
        {listening ? (
          <ListeningAnimation />
        ) : (
          <ChronicleLogo />
        )}
      </section>

      {!listening ? (
        <>
          <section className="home-actions">
            <button>▧　Create an image</button>
            <button>文　Translate language</button>
            <button>◎　Search the web</button>
          </section>

          <footer className="ask-bar">
            <button className="plus-button">+</button>

            <span className="ask-placeholder">
              Ask Chronicle
            </span>

            <button className="small-tool">☺</button>
            <button className="small-tool">🎙</button>

            <button
              className="voice-button"
              onClick={handleVoiceClick}
            >
              <MiniWave />
              Voice
            </button>
          </footer>
        </>
      ) : (
        <section className="listening-controls">
          <button
            className="stop-button"
            onClick={handleVoiceClick}
          >
            Stop listening
          </button>
        </section>
      )}

    </main>
  );
}
