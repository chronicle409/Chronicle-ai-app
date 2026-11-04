
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
  const bars = Array.from({ length: 100 }, (_, i) => {
    const angle = (i * 360) / 100;
    const height =
      7 +
      Math.abs(Math.sin(i * 0.37)) * 8 +
      Math.abs(Math.cos(i * 0.19)) * 5;

    return (
      <line
        key={i}
        x1="160"
        y1="17"
        x2="160"
        y2={17 + height}
        transform={`rotate(${angle} 160 160)`}
        stroke="url(#spectrumGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.95"
      />
    );
  });

  return (
    <div className="findora-animation">
      <svg
        className="findora-visualizer"
        viewBox="0 0 320 320"
      >
        <defs>
          <linearGradient
            id="spectrumGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ff8a00" />
            <stop offset="45%" stopColor="#ff452d" />
            <stop offset="100%" stopColor="#ec174c" />
          </linearGradient>

          <filter id="redGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rotating outer audio spectrum */}
        <g className="spectrum-spin">
          {bars}
        </g>

        {/* Outer glowing red ring */}
        <circle
          cx="160"
          cy="160"
          r="118"
          fill="none"
          stroke="#ed174c"
          strokeWidth="3"
          strokeDasharray="105 42 68 527"
          strokeLinecap="round"
          filter="url(#redGlow)"
          className="outer-red-ring"
        />

        {/* Inner glowing ring */}
        <circle
          cx="160"
          cy="160"
          r="105"
          fill="none"
          stroke="#ff1744"
          strokeWidth="4"
          strokeDasharray="115 545"
          strokeLinecap="round"
          filter="url(#redGlow)"
          className="inner-red-ring"
        />

        {/* White centre */}
        <circle
          cx="160"
          cy="160"
          r="91"
          fill="#ffffff"
          className="centre-pulse"
        />

        {/* Red waveform */}
        <path
          d="M111 160
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
             L210 160"
          fill="none"
          stroke="#ed174c"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="centre-wave"
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
    <main className={`chronicle-app ${listening ? "is-listening" : ""}`}>

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
          width: min(76vw, 330px);
          height: auto;
          overflow: visible;
        }

        .spectrum-spin {
          transform-origin: 160px 160px;
          animation: spectrumRotate 22s linear infinite;
        }

        @keyframes spectrumRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .outer-red-ring {
          animation: outerRingRotate 5s linear infinite;
          transform-origin: 160px 160px;
        }

        .inner-red-ring {
          animation: innerRingRotate 3s linear infinite;
          transform-origin: 160px 160px;
        }

        @keyframes outerRingRotate {
          to { transform: rotate(360deg); }
        }

        @keyframes innerRingRotate {
          to { transform: rotate(-360deg); }
        }

        .centre-pulse {
          transform-origin: 160px 160px;
          animation: centrePulse 2s ease-in-out infinite;
        }

        @keyframes centrePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.025); }
        }

        .centre-wave {
          animation: waveGlow 1.5s ease-in-out infinite alternate;
        }

        @keyframes waveGlow {
          from { opacity: 0.7; }
          to { opacity: 1; }
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
          background: white;
          animation: bottomBarPulse 0.7s ease-in-out infinite alternate;
        }

        @keyframes bottomBarPulse {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .spectrum-spin,
          .outer-red-ring,
          .inner-red-ring,
          .centre-pulse,
          .centre-wave,
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
            <span className="ask-placeholder">Ask Chronicle</span>
            <button className="small-tool">☺</button>
            <button className="small-tool">🎙</button>

            <button className="voice-button" onClick={handleVoiceClick}>
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
