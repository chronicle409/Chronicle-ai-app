
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
  findoraAudio.volume = 1;
  findoraAudio.preload = "auto";

  findoraAudio.play().catch((error) => {
    console.error("Chronicle sound error:", error);
  });

  return findoraAudio;
}

function Waveform() {
  return (
    <svg viewBox="0 0 120 60" className="waveform">
      <path
        d="M5 30 L20 30 L29 19 L38 43 L48 9 L59 52 L69 16 L80 39 L89 25 L99 30 L115 30"
        fill="none"
        stroke="#ed174c"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const visualizerBars = Array.from({ length: 96 }, (_, i) => {
  const angle = (i * 360) / 96 - 90;

  return {
    angle,
    delay: `${(i % 12) * 0.07}s`,
    duration: `${0.45 + (i % 5) * 0.12}s`,
    color: i < 48 ? "#ed174c" : "#d66a32",
  };
});

function Visualizer() {
  return (
    <svg className="visualizer" viewBox="0 0 260 260">
      {visualizerBars.map((bar, i) => (
        <g
          key={i}
          transform={`rotate(${bar.angle} 130 130)`}
        >
          <line
            className="equalizer-bar"
            x1="130"
            y1="10"
            x2="130"
            y2="25"
            stroke={bar.color}
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              animationDelay: bar.delay,
              animationDuration: bar.duration,
            }}
          />
        </g>
      ))}

      <circle
        cx="130"
        cy="130"
        r="94"
        className="red-arc"
      />

      <circle
        cx="130"
        cy="130"
        r="84"
        className="pink-arc"
      />

      <circle
        cx="130"
        cy="130"
        r="76"
        className="orange-arc"
      />
    </svg>
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
      <header className="chronicle-header">
        <button aria-label="Menu">☰</button>
        <button aria-label="Search">⌕</button>
      </header>

      <div className="visualizer-container">
        {listening && <Visualizer />}

        <div className="voice-circle">
          <Waveform />
        </div>
      </div>

      {listening ? (
        <>
          <section className="listening-info">
            <h2>Listening for music</h2>
            <p>
              Make sure your device can hear the sound clearly
            </p>

            <div className="sound-bars">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} />
              ))}
            </div>
          </section>

          <button
            className="stop-button"
            onClick={handleVoiceClick}
          >
            Stop listening
          </button>
        </>
      ) : (
        <>
          <div className="home-actions">
            <button>Create an image</button>
            <button>Translate language</button>
            <button>Search the web</button>
          </div>

          <div className="ask-bar">
            <span>Ask Chronicle</span>
            <span>☺</span>
            <span>🎙</span>
            <button onClick={handleVoiceClick}>
              Voice
            </button>
          </div>
        </>
      )}
    </main>
  );
}
