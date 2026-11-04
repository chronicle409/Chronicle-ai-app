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
  findoraAudio.play().catch(console.error);

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

function Visualizer() {
  const bars = Array.from({ length: 120 }, (_, i) => {
    const angle = (i * 360) / 120;
    const variation =
      5 + Math.abs(Math.sin(i * 0.45)) * 8;

    const inner = 105;
    const outer = inner + variation;

    const rad = (angle * Math.PI) / 180;

    return {
      x1: 130 + inner * Math.cos(rad),
      y1: 130 + inner * Math.sin(rad),
      x2: 130 + outer * Math.cos(rad),
      y2: 130 + outer * Math.sin(rad),
      delay: `${i * 0.018}s`,
      color: i < 65 ? "#d66a32" : "#e51c50",
    };
  });

  return (
    <svg className="visualizer" viewBox="0 0 260 260">
      {bars.map((bar, i) => (
        <line
          key={i}
          x1={bar.x1}
          y1={bar.y1}
          x2={bar.x2}
          y2={bar.y2}
          stroke={bar.color}
          strokeWidth="2"
          strokeLinecap="round"
          className="equalizer-bar"
          style={{ animationDelay: bar.delay }}
        />
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
    </svg>
  );
}

export default function App() {
  const [listening, setListening] = useState(false);

  function handleVoiceClick() {
    playFindoraSound(listening ? "off" : "on");
    setListening(!listening);
  }

  return (
    <main className={`chronicle-app ${listening ? "is-listening" : ""}`}>
      <header className="chronicle-header">
        <button>☰</button>
        <button>⌕</button>
      </header>

      <div className="visualizer-container">
        <Visualizer />

        <div className="voice-circle">
          <Waveform />
        </div>
      </div>

      {listening ? (
        <>
          <section className="listening-info">
            <h2>Listening for music</h2>
            <p>Make sure your device can hear the sound clearly</p>

            <div className="sound-bars">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} />
              ))}
            </div>
          </section>

          <button className="stop-button" onClick={handleVoiceClick}>
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
            <button onClick={handleVoiceClick}>Voice</button>
          </div>
        </>
      )}
    </main>
  );
              }
