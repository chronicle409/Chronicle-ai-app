
import React from "react";

export default function App() {
  return (
    <div className="app">
      <div className="chat-area">
        <div className="welcome">
          <h2>Chronicle</h2>
          <p>How can I help you today?</p>
        </div>
      </div>

      <div className="composer">
        <button className="plus">+</button>

        <input
          className="prompt"
          placeholder="Ask Chronicle"
        />

        <button className="smallbtn" aria-label="Emoji">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
          </svg>
        </button>

        <button className="smallbtn" aria-label="Microphone">
          <svg viewBox="0 0 24 24">
            <rect x="9" y="2" width="6" height="13" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v4M9 22h6" />
          </svg>
        </button>

        <button className="voice-btn">
          <svg viewBox="0 0 24 24">
            <path d="M2 12h3l2-6 3 12 3-16 3 16 2-6h4" />
          </svg>
          <span>Voice</span>
        </button>
      </div>
    </div>
  );
}

const styles = `
* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  width: 100%;
  min-height: 100%;
  background: #0b0b0d;
  color: white;
  font-family: Arial, sans-serif;
}

.app {
  min-height: 100dvh;
  background: #0b0b0d;
  position: relative;
  padding-bottom: 90px;
}

.chat-area {
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.welcome {
  text-align: center;
}

.welcome h2 {
  font-size: 25px;
  margin: 0 0 8px;
}

.welcome p {
  color: #999;
  font-size: 14px;
}

.composer {
  position: fixed;
  left: 50%;
  bottom: max(16px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: calc(100% - 28px);
  max-width: 620px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 7px;
  background: #202024;
  border: 1px solid #34343a;
  border-radius: 30px;
}

.composer button {
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.plus {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  color: #f5f5f5;
  font-size: 27px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prompt {
  flex: 1;
  min-width: 0;
  width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: white;
  font-size: 14px;
}

.prompt::placeholder {
  color: #aaa;
}

.smallbtn {
  width: 29px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #ddd;
  padding: 5px;
}

.smallbtn svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.voice-btn {
  height: 40px;
  min-width: 77px;
  padding: 0 10px;
  border-radius: 22px;
  background: #2879f5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
}

.voice-btn svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: white;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (max-width: 380px) {
  .composer {
    width: calc(100% - 20px);
    gap: 3px;
    padding: 5px;
  }

  .plus {
    width: 29px;
  }

  .smallbtn {
    width: 26px;
  }

  .voice-btn {
    min-width: 72px;
    padding: 0 8px;
  }
}
`;

export function ComposerStyles() {
  return <style>{styles}</style>;
}
