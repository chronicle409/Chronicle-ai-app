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
    <svg
      className="waveform"
      viewBox="0 0 100 60"
      aria-hidden="true"
    >
      <path
        d="M5 30 L15 30 L22 17 L30 44 L39 10 L48 48 L57 20 L65 38 L73 25 L82 30 L95 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EnergyRings() {
  return (
    <svg
      className="energy-rings"
      viewBox="0 0 240 240"
      aria-hidden="true"
    >
      <path
        className="ring ring-orange"
        d="M120 12 C158 8 205 40 222 82 C244 128 211 184 177 211 C137 242 80 221 42 190 C4 158 10 95 37 54 C57 24 88 12 120 12Z"
      />
      <path
        className="ring ring-red"
        d="M125 19 C166 17 213 56 216 102 C222 148 185 203 138 218 C92 233 39 193 25 151 C10 107 44 45 80 28 C95 21 108 19 125 19Z"
      />
      <path
        className="ring ring-pink"
        d="M119 25 C165 25 201 60 207 106 C214 151 176 193 133 205 C91 217 43 180 34 139 C24 97 58 43 95 30 C103 27 111 25 119 25Z"
      />
      <path
        className="ring ring-bright"
        d="M119 30 C157 27 194 62 198 102 C204 145 170 182 131 194 C93 205 51 174 42 137 C33 99 61 52 94 36"
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
        <button aria-label="Open menu">☰</button>
        <button aria-label="Search">⌕</button>
      </header>

      <div className="voice-container">
        {listening && <EnergyRings />}

        <div className="voice-circle">
          <Waveform />
        </div>
      </div>

      {listening ? (
        <>
          <div className="voice-dots">
            <span />
            <span />
            <span />
          </div>

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
