
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
  const bars = Array.from({ length: 180 }, (_, i) => {
    const angle = (i * 360) / 180;

    const height =
      3 +
      Math.abs(Math.sin(i * 0.37)) * 7 +
      Math.abs(Math.cos(i * 0.19)) * 4;

    return {
      angle,
      height,
      delay: `${(i % 30) * -0.08}s`,
      width: i % 5 === 0 ? 1.8 : 1.2
    };
  });

  return (
    <div className="findora-animation">

      <svg
        className="findora-visualizer"
        viewBox="0 0 320 320"
      >
        <defs>

          {/* Red neon spectrum gradient */}

          <linearGradient
            id="findoraSpectrum"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ff1744" />
            <stop offset="25%" stopColor="#ff527c" />
            <stop offset="50%" stopColor="#ed174c" />
            <stop offset="75%" stopColor="#a00036" />
            <stop offset="100%" stopColor="#ff315e" />
          </linearGradient>

          {/* Neon glow */}

          <filter id="findoraSpectrumGlow">
            <feGaussianBlur
              stdDeviation="2.5"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

        </defs>

        {/* Circular rotating audio spectrum */}

        <g
          className="findora-spectrum-spin"
          filter="url(#findoraSpectrumGlow)"
        >
          {bars.map((bar, i) => (
            <line
              key={i}
              className="findora-spectrum-bar"
              x1="160"
              y1="68"
              x2="160"
              y2={68 - bar.height}
              transform={`rotate(${bar.angle} 160 160)`}
              stroke="url(#findoraSpectrum)"
              strokeWidth={bar.width}
              strokeLinecap="round"
              style={{
                animationDelay: bar.delay
              }}
            />
          ))}
        </g>

        {/* Fine circular neon outline */}

        <circle
          cx="160"
          cy="160"
          r="92"
          fill="none"
          stroke="#ed174c"
          strokeWidth="0.8"
          opacity="0.5"
          className="findora-outline"
        />

        {/* Small glowing particles */}

        <g className="findora-orbit-particles">
          {Array.from({ length: 36 }, (_, i) => (
            <circle
              key={i}
              cx="160"
              cy="67"
              r={i % 3 === 0 ? 1.5 : 0.8}
              fill="#ff527c"
              opacity="0.9"
              transform={`rotate(${i * 10} 160 160)`}
            />
          ))}
        </g>

        {/* Original white oval logo */}

        <ellipse
          cx="160"
          cy="160"
          rx="70"
          ry="54"
          fill="#ffffff"
        />

        {/* Original pink waveform */}

        <path
          d="
            M111 160
            L122 160
            L130 155
            L138 164
            L146 151
            L153 175
            L160 132
            L168 183
            L176 145
            L183 164
            L190 153
            L198 160
            L210 160
          "
          fill="none"
          stroke="#ed174c"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="findora-centre-wave"
        />

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
          width: min(76vw, 300px);
          height: auto;
          overflow: visible;
        }

        /* Rotating circular spectrum */

        .findora-spectrum-spin {
          transform-origin: 160px 160px;
          animation: findoraSpectrumRotate 18s linear infinite;
        }

        @keyframes findoraSpectrumRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* Individual glowing audio bars */

        .findora-spectrum-bar {
          animation: findoraBarPulse
            0.65s ease-in-out infinite alternate;
        }

        @keyframes findoraBarPulse {
          0% {
            opacity: 0.35;
          }

          50% {
            opacity: 0.75;
          }

          100% {
            opacity: 1;
          }
        }

        /* Outer neon circle */

        .findora-outline {
          transform-origin: 160px 160px;
          animation: findoraOutlinePulse
            2s ease-in-out infinite;
        }

        @keyframes findoraOutlinePulse {
          0%, 100% {
            opacity: 0.3;
          }

          50% {
            opacity: 0.9;
          }
        }

        /* Orbiting particles */

        .findora-orbit-particles {
          transform-origin: 160px 160px;
          animation: findoraOrbit
            10s linear infinite;
        }

        @keyframes findoraOrbit {
          to {
            transform: rotate(360deg);
          }
        }

        /* Original logo waveform */

        .findora-centre-wave {
          animation: findoraWaveGlow
            1.3s ease-in-out infinite alternate;
        }

        @keyframes findoraWaveGlow {
          from {
            opacity: 0.7;
          }

          to {
            opacity: 1;
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
          .findora-spectrum-spin,
          .findora-spectrum-bar,
          .findora-outline,
          .findora-orbit-particles,
          .findora-centre-wave,
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
