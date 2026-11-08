
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");

  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  useEffect(() => {
    if (!voiceOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const count = 120;
    const bars = Array.from({ length: count }, () => ({
      value: 3,
      gain: 0.65 + Math.random() * 1.2,
    }));

    let raf;
    let bins = null;

    function render() {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.29;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const analyser = analyserRef.current;

      if (analyser) {
        if (!bins || bins.length !== analyser.frequencyBinCount) {
          bins = new Uint8Array(analyser.frequencyBinCount);
        }

        if (listeningRef.current) {
          analyser.getByteFrequencyData(bins);
        } else {
          bins.fill(0);
        }
      }

      let peak = 0;
      let average = 0;

      if (bins && listeningRef.current) {
        for (let i = 0; i < bins.length; i++) {
          average += bins[i];
          peak = Math.max(peak, bins[i]);
        }
        average /= bins.length;
      }

      const speaking =
        listeningRef.current && peak > 24 && average > 3;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;

        const index = bins
          ? Math.min(
              bins.length - 1,
              Math.floor(Math.pow(i / count, 1.7) * bins.length)
            )
          : 0;

        const energy = speaking && bins ? bins[index] / 255 : 0;
        const target = speaking
          ? 3 + energy * 54 * bars[i].gain
          : 3;

        bars[i].value += (target - bars[i].value) * 0.2;

        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(angle) * radius,
          cy + Math.sin(angle) * radius
        );
        ctx.lineTo(
          cx + Math.cos(angle) * (radius + bars[i].value),
          cy + Math.sin(angle) * (radius + bars[i].value)
        );

        const hue = 190 + (i / count) * 85;
        ctx.strokeStyle = `hsla(${hue},100%,62%,${0.65 + energy * 0.35})`;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      const t = performance.now() * 0.00025;

      [
        { r: radius - 12, a: t * 0.6, c: "#00BFFF" },
        { r: radius - 21, a: -t * 0.45, c: "#4169E1" },
        { r: radius - 30, a: t * 0.3, c: "#655CFF" },
      ].forEach((ring) => {
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, ring.a, ring.a + 1.5);
        ctx.strokeStyle = ring.c;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.stroke();
      });

      raf = requestAnimationFrame(render);
    }

    render();
    return () => cancelAnimationFrame(raf);
  }, [voiceOpen]);

  async function startVoice() {
    setNotice("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone unavailable");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      const audio = new AudioContextClass();
      audioRef.current = audio;

      const source = audio.createMediaStreamSource(stream);
      const analyser = audio.createAnalyser();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;

      source.connect(analyser);
      analyserRef.current = analyser;
      setListening(true);
    } catch {
      setNotice("Please allow microphone access to use Voice.");
      setListening(false);
    }
  }

  function stopVoice() {
    setListening(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    streamRef.current = null;

    if (audioRef.current) {
      audioRef.current.close().catch(() => {});
    }

    audioRef.current = null;
    analyserRef.current = null;
  }

  async function toggleVoice() {
    if (voiceOpen) {
      stopVoice();
      setVoiceOpen(false);
    } else {
      setVoiceOpen(true);
      await startVoice();
    }
  }

  function chooseTool(tool) {
    setPrompt(tool);
    setNotice("");
  }

  return (
    <main className="findora">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html, body, #root {
          margin: 0;
          width: 100%;
          height: 100%;
          background: #000;
        }

        body {
          font-family: Arial, Helvetica, sans-serif;
          overflow: hidden;
        }

        .findora {
          position: relative;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          min-height: 500px;
          overflow: hidden;
          background: #000;
          color: #fff;
        }

        /* Top left and right controls */

        .topbar {
          position: absolute;
          top: 4.1%;
          left: 4.1%;
          right: 4.1%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 5;
        }

        .iconbtn {
          width: 48px;
          height: 48px;
          padding: 0;
          display: grid;
          place-items: center;
          border: none;
          background: transparent;
          color: white;
          cursor: pointer;
        }

        .menu-icon {
          width: 48px;
          height: 48px;
          fill: none;
          stroke: white;
          stroke-width: 3;
          stroke-linecap: round;
        }

        .profile-icon {
          width: 45px;
          height: 45px;
          fill: none;
          stroke: white;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* Centre logo */

        .center-stage {
          position: absolute;
          top: 35.6%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: grid;
          place-items: center;
        }

        .pulse-logo {
          width: min(30.2vw, 208px);
          height: min(30.2vw, 208px);
          border-radius: 50%;
          background: #fff;
          display: grid;
          place-items: center;
        }

        .pulse-logo svg {
          width: 76%;
          height: 62%;
        }

        /* Voice animation */

        .voice-stage {
          position: absolute;
          top: 35.6%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: grid;
          place-items: center;
        }

        .voice-canvas {
          width: min(70vw, 300px);
          height: min(70vw, 300px);
        }

        /* Options at bottom left */

        .tool-list {
          position: absolute;
          left: 10.5%;
          bottom: 12.1%;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .tool {
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 0;
          border: none;
          background: transparent;
          color: #f5f5f5;
          font-size: clamp(15px, 3.45vw, 23px);
          font-weight: 400;
          text-align: left;
          white-space: nowrap;
          cursor: pointer;
        }

        .tool svg {
          width: 47px;
          height: 47px;
          flex: none;
          fill: none;
          stroke: white;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ChatGPT-style chat section */

        .composer {
          position: absolute;
          left: 10.2%;
          bottom: 4.2%;
          width: 76%;
          height: 88px;
          border-radius: 55px;
          background: #171717;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 5px;
          padding: 7px 9px;
        }

        .plus {
          flex: none;
          width: 48px;
          height: 48px;
          border: none;
          background: transparent;
          color: white;
          font-size: 39px;
          font-weight: 300;
          line-height: 1;
          cursor: pointer;
        }

        .prompt {
          flex: 1;
          width: 0;
          min-width: 0;
          padding: 0 4px;
          outline: none;
          border: none;
          background: transparent;
          color: white;
          font-size: 17px;
        }

        .prompt::placeholder {
          color: #d0d0d0;
          opacity: 1;
        }

        .smallbtn {
          flex: none;
          width: 39px;
          height: 42px;
          padding: 2px;
          display: grid;
          place-items: center;
          border: none;
          background: transparent;
          color: white;
          cursor: pointer;
        }

        .smallbtn svg {
          width: 34px;
          height: 34px;
          fill: none;
          stroke: white;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .mic svg {
          width: 33px;
          height: 39px;
        }

        .voice-btn {
          flex: none;
          height: 72px;
          padding: 0 15px;
          border: none;
          border-radius: 45px;
          background: #0878f9;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 18px;
          white-space: nowrap;
          cursor: pointer;
        }

        .voice-btn svg {
          width: 39px;
          height: 39px;
          fill: none;
          stroke: white;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .voice-btn.active {
          background: #075dcc;
        }

        /* Pop-up menus */

        .popover {
          position: absolute;
          top: 95px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 15px 20px;
          background: #1b1b1b;
          border: 1px solid #333;
          border-radius: 14px;
        }

        .popover.left {
          left: 5%;
        }

        .popover.right {
          right: 5%;
        }

        .popover button {
          padding: 5px;
          border: none;
          background: transparent;
          color: white;
          text-align: left;
          font-size: 16px;
        }

        .notice {
          position: absolute;
          bottom: 1%;
          left: 5%;
          right: 5%;
          color: #aaa;
          text-align: center;
          font-size: 12px;
        }

        /* Smaller phones */

        @media (max-width: 380px) {
          .composer {
            left: 6%;
            width: 88%;
            height: 72px;
            padding: 5px 7px;
            gap: 2px;
          }

          .plus {
            width: 36px;
            font-size: 34px;
          }

          .prompt {
            font-size: 14px;
          }

          .smallbtn {
            width: 31px;
          }

          .smallbtn svg {
            width: 28px;
            height: 28px;
          }

          .voice-btn {
            height: 58px;
            padding: 0 9px;
            gap: 4px;
            font-size: 15px;
          }

          .voice-btn svg {
            width: 29px;
            height: 29px;
          }

          .tool {
            gap: 14px;
            font-size: 15px;
          }

          .tool svg {
            width: 39px;
            height: 39px;
          }
        }

        @media (max-height: 700px) {
          .tool-list {
            bottom: 14%;
            gap: 12px;
          }

          .composer {
            height: 65px;
          }

          .voice-btn {
            height: 53px;
          }

          .center-stage,
          .voice-stage {
            top: 35%;
          }
        }
      `}</style>

      <header className="topbar">
        <button
          className="iconbtn"
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="menu-icon" viewBox="0 0 48 48">
            <path d="M5 9h38M5 24h38M5 39h38" />
          </svg>
        </button>

        <button
          className="iconbtn"
          aria-label="Profile"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <svg className="profile-icon" viewBox="0 0 64 64">
            <path d="M12 29L18 28L23 13Q24 8 29 10Q37 13 43 10Q48 8 50 14L55 28L60 30L59 36L7 36L5 32Z" />
            <path d="M9 31Q31 36 57 31" />
            <circle cx="20" cy="44" r="9" />
            <circle cx="44" cy="44" r="9" />
            <path d="M29 44Q32 40 35 44" />
          </svg>
        </button>
      </header>

      {menuOpen && (
        <div className="popover left">
          <button onClick={() => setMenuOpen(false)}>New chat</button>
          <button onClick={() => setMenuOpen(false)}>History</button>
          <button onClick={() => setMenuOpen(false)}>Settings</button>
        </div>
      )}

      {profileOpen && (
        <div className="popover right">
          <button onClick={() => setProfileOpen(false)}>Profile</button>
          <button onClick={() => setProfileOpen(false)}>Settings</button>
        </div>
      )}

      {voiceOpen ? (
        <section className="voice-stage">
          <canvas
            ref={canvasRef}
            className="voice-canvas"
            width="500"
            height="500"
          />
        </section>
      ) : (
        <section className="center-stage">
          <div className="pulse-logo">
            <svg viewBox="0 0 180 130">
              <path
                d="M8 66 C25 67 35 83 49 68 L61 54 L72 94 Q77 106 82 88 L91 36 Q95 17 100 45 L110 112 Q114 126 119 101 L131 28 Q136 5 141 40 L148 70 Q152 84 171 57"
                fill="none"
                stroke="#0878f9"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </section>
      )}

      {!voiceOpen && (
        <section className="tool-list">
          <button
            className="tool"
            onClick={() => chooseTool("Create an image")}
          >
            <svg viewBox="0 0 48 48">
              <rect x="4" y="4" width="40" height="40" rx="5" />
              <circle cx="32" cy="15" r="4" />
              <path d="M5 36l12-13 8 8 5-5 13 13" />
            </svg>
            Create an image
          </button>

          <button
            className="tool"
            onClick={() => chooseTool("Translate language")}
          >
            <svg viewBox="0 0 48 48">
              <path d="M5 7h25v23H18l-8 7v-7H5zM19 18h23v22h-7l-7 5v-5h-9" />
              <path d="M12 14h11M17 11v3M14 23l5-7 5 7M31 26h7M34 23v3" />
            </svg>
            Translate language
          </button>

          <button
            className="tool"
            onClick={() => chooseTool("Search the web")}
          >
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" />
              <path d="M4 24h40M24 4c-12 11-12 29 0 40M24 4c12 11 12 29 0 40" />
            </svg>
            Search the web
          </button>
        </section>
      )}

      <div className="composer">
        <button
          className="plus"
          aria-label="More options"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          +
        </button>

        <input
          className="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Chronicle"
        />

        <button
          className="smallbtn"
          aria-label="Emoji"
          onClick={() => setPrompt((p) => p + " 🙂")}
        >
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" />
            <path d="M14 24s2 5 6 5 6-5 6-5M14 15h.1M26 15h.1" />
          </svg>
        </button>

        <button
          className="smallbtn mic"
          aria-label="Microphone"
          onClick={toggleVoice}
        >
          <svg viewBox="0 0 40 44">
            <rect x="13" y="3" width="14" height="25" rx="7" />
            <path d="M7 21a13 13 0 0 0 26 0M20 34v7M14 41h12" />
          </svg>
        </button>

        <button
          className={`voice-btn ${voiceOpen ? "active" : ""}`}
          onClick={toggleVoice}
        >
          <svg viewBox="0 0 40 40">
            <path d="M2 21h5l4-10 5 20 5-25 5 28 5-17 4 4h3" />
          </svg>
          {voiceOpen ? "Close" : "Voice"}
        </button>
      </div>

      {notice && <p className="notice">{notice}</p>}
    </main>
  );
}
