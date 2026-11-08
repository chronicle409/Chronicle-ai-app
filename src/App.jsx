
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.31;
      const analyser = analyserRef.current;
      const data = analyser
        ? new Uint8Array(analyser.frequencyBinCount)
        : null;

      if (analyser && data) analyser.getByteFrequencyData(data);

      frame += 0.012;

      // Soft outer rings
      [1.18, 1.27, 1.36].forEach((scale, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 125, 255, ${0.13 - i * 0.025})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Individually moving waveform bars
      const bars = 120;

      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2;
        const audioValue = data
          ? data[Math.floor((i / bars) * data.length)] / 255
          : 0;

        const movement =
          Math.sin(frame * 2.2 + i * 0.31) * 3 +
          Math.cos(frame * 1.4 + i * 0.17) * 2;

        const soundMovement = listening ? audioValue * 38 : 0;
        const length = 4 + Math.max(0, movement) + soundMovement;

        const inner = baseRadius;
        const outer = inner + length;

        const x1 = cx + Math.cos(angle) * inner;
        const y1 = cy + Math.sin(angle) * inner;
        const x2 = cx + Math.cos(angle) * outer;
        const y2 = cy + Math.sin(angle) * outer;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, "#287bff");
        gradient.addColorStop(0.55, "#41c8ff");
        gradient.addColorStop(1, "#9b6cff");

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Three rotating accent arcs
      const colors = ["#287bff", "#35c9ff", "#9b6cff"];

      colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          baseRadius * (1.08 + i * 0.055),
          frame * (i % 2 ? -0.8 : 0.8) + i,
          frame * (i % 2 ? -0.8 : 0.8) + i + 0.75
        );
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [listening]);

  const stopVoice = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.close().catch(() => {});
      audioRef.current = null;
    }

    analyserRef.current = null;
    setListening(false);
  };

  const startVoice = async () => {
    try {
      if (listening) {
        stopVoice();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      const audioContext = new AudioContextClass();
      audioRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setListening(true);
      setVoiceOpen(true);
    } catch (error) {
      setNotice("Please allow microphone access to use voice.");
    }
  };

  const handleSend = () => {
    if (!prompt.trim()) return;
    setNotice("Your message is ready: " + prompt.trim());
    setPrompt("");
  };

  return (
    <div className="findora">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html, body, #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
          background: #000;
        }

        body {
          font-family: Arial, Helvetica, sans-serif;
          color: white;
        }

        button {
          font-family: inherit;
          -webkit-tap-highlight-color: transparent;
        }

        .findora {
          width: 100%;
          height: 100dvh;
          min-height: 500px;
          background: #000;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        .topbar {
          position: absolute;
          top: 4.1%;
          left: 4.1%;
          right: 4.1%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .iconbtn {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
          cursor: pointer;
        }

        .menu-icon {
          width: 30px;
          height: 30px;
          display: block;
        }

        .profile-icon {
          width: 32px;
          height: 32px;
          display: block;
        }

        .center-stage {
          position: absolute;
          top: 35.6%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          pointer-events: none;
        }

        .pulse-logo {
          width: min(30.2vw, 208px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 0 35px rgba(45, 125, 255, 0.12);
        }

        .pulse-logo svg {
          width: 62%;
          height: 62%;
        }

        .voice-stage {
          position: absolute;
          top: 35.6%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(70vw, 300px);
          aspect-ratio: 1;
          pointer-events: none;
        }

        .voice-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .tool-list {
          position: absolute;
          left: 10.5%;
          bottom: 12.1%;
          display: flex;
          flex-direction: column;
          gap: 25px;
          z-index: 2;
        }

        .tool {
          border: 0;
          padding: 0;
          background: transparent;
          color: #f5f5f5;
          display: flex;
          align-items: center;
          gap: 13px;
          text-align: left;
          font-size: clamp(15px, 3.45vw, 23px);
          cursor: pointer;
        }

        .tool svg {
          width: 47px;
          height: 47px;
          flex-shrink: 0;
        }

        .composer {
          position: absolute;
          left: 10.2%;
          bottom: 4.2%;
          width: 76%;
          height: 88px;
          border: 1px solid #333;
          border-radius: 28px;
          background: #191919;
          display: flex;
          align-items: center;
          padding: 10px 12px;
          gap: 10px;
          z-index: 5;
        }

        .plus {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #fff;
          font-size: 29px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .prompt {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: white;
          font-size: 16px;
        }

        .prompt::placeholder {
          color: #999;
        }

        .smallbtn {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: #303030;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .mic {
          width: 19px;
          height: 19px;
        }

        .voice-btn {
          height: 72px;
          min-width: 72px;
          border: 0;
          border-radius: 23px;
          background: #287bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0 17px;
          gap: 8px;
          flex-shrink: 0;
        }

        .voice-btn svg {
          width: 30px;
          height: 30px;
        }

        .popover {
          position: absolute;
          top: 75px;
          left: 4.1%;
          background: #1c1c1c;
          border: 1px solid #333;
          border-radius: 14px;
          padding: 14px;
          min-width: 150px;
          z-index: 20;
          font-size: 14px;
        }

        .popover.right {
          left: auto;
          right: 4.1%;
        }

        .notice {
          position: absolute;
          bottom: 145px;
          left: 50%;
          transform: translateX(-50%);
          background: #222;
          border: 1px solid #444;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          max-width: 85%;
          z-index: 30;
          text-align: center;
        }

        @media (max-width: 380px) {
          .tool-list {
            left: 6%;
            bottom: 13%;
            gap: 17px;
          }

          .tool {
            font-size: 14px;
            gap: 10px;
          }

          .tool svg {
            width: 36px;
            height: 36px;
          }

          .composer {
            left: 6%;
            width: 88%;
            height: 72px;
            bottom: 4%;
            border-radius: 23px;
            padding: 8px;
            gap: 6px;
          }

          .voice-btn {
            height: 58px;
            min-width: 58px;
            border-radius: 18px;
            padding: 0 12px;
          }

          .voice-btn svg {
            width: 26px;
            height: 26px;
          }

          .plus, .smallbtn {
            width: 32px;
            height: 32px;
          }

          .prompt {
            font-size: 14px;
          }
        }

        @media (max-height: 700px) {
          .center-stage, .voice-stage {
            top: 32%;
          }

          .tool-list {
            bottom: 14%;
            gap: 14px;
          }

          .composer {
            bottom: 3%;
          }
        }
      `}</style>

      <div className="topbar">
        <button
          className="iconbtn"
          onClick={() => {
            setMenuOpen(!menuOpen);
            setProfileOpen(false);
          }}
          aria-label="Open menu"
        >
          <svg className="menu-icon" viewBox="0 0 48 48" fill="none">
            <path
              d="M8 14H40M8 24H40M8 34H40"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          className="iconbtn"
          onClick={() => {
            setProfileOpen(!profileOpen);
            setMenuOpen(false);
          }}
          aria-label="Open profile"
        >
          <svg className="profile-icon" viewBox="0 0 48 48" fill="none">
            <path
              d="M9 21L15 13L24 10L33 13L39 21L35 27H13L9 21Z"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M15 29C15 25 19 23 24 23C29 23 33 25 33 29"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="19" cy="19" r="2" fill="white" />
            <circle cx="29" cy="19" r="2" fill="white" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="popover">
          <div>New chat</div>
          <p>History</p>
          <p>Settings</p>
        </div>
      )}

      {profileOpen && (
        <div className="popover right">
          <div>Profile</div>
          <p>Settings</p>
        </div>
      )}

      <div className="center-stage">
        <div className="pulse-logo">
          <svg viewBox="0 0 120 120" fill="none">
            <path
              d="M12 60H25L34 42L45 78L57 27L70 91L82 45L92 60H108"
              stroke="#287bff"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="voice-stage">
        <canvas ref={canvasRef} className="voice-canvas" />
      </div>

      <div className="tool-list">
        <button className="tool" onClick={() => setNotice("Image creation selected")}>
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="5" y="7" width="38" height="34" rx="7" stroke="white" strokeWidth="2" />
            <circle cx="17" cy="18" r="4" stroke="white" strokeWidth="2" />
            <path d="M8 35L20 25L28 32L34 26L41 34" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Create an image</span>
        </button>

        <button className="tool" onClick={() => setNotice("Language translation selected")}>
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M7 11H29M18 7V11M12 16C15 24 22 29 29 32M28 16C25 24 18 29 11 32M12 16H29" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M27 39L34 21L41 39M30 32H38" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Translate language</span>
        </button>

        <button className="tool" onClick={() => setNotice("Web search selected")}>
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="21" cy="21" r="13" stroke="white" strokeWidth="2" />
            <path d="M31 31L41 41" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path d="M8 21H34M21 8C16 14 16 28 21 34M21 8C26 14 26 28 21 34" stroke="white" strokeWidth="1.5" />
          </svg>
          <span>Search the web</span>
        </button>
      </div>

      <div className="composer">
        <button className="plus" onClick={() => setNotice("More options")}>+</button>

        <input
          className="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSend();
          }}
          placeholder="Ask anything"
        />

        <button className="smallbtn" onClick={handleSend} aria-label="Send message">
          <svg viewBox="0 0 24 24" fill="none" className="mic">
            <path d="M12 15V4M8 8V12C8 17 16 17 16 12V8M5 12C5 21 19 21 19 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <button className="voice-btn" onClick={startVoice} aria-label="Start voice">
          <svg viewBox="0 0 48 48" fill="none">
            <path
              d="M5 24H10L14 13L19 35L24 9L29 39L34 17L38 24H43"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {notice && (
        <div className="notice" onClick={() => setNotice("")}>
          {notice}
        </div>
      )}
    </div>
  );
}
