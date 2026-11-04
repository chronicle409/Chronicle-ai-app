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

      <div className="voice-circle">
        <span>〰</span>
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
