
import { useEffect, useRef, useState } from "react";
import "./App.css";

let findoraAudio = null;

function playFindoraSound(type = "on") {
  const file =
    type === "off"
      ? "/findora-off-clean.mp3"
      : "/findora-on-fixed.mp3";

  if (findoraAudio) {
    findoraAudio.pause();
    findoraAudio.currentTime = 0;
  }

  findoraAudio = new Audio(file);
  findoraAudio.volume = 1;

  findoraAudio.play().catch((error) => {
    console.error("FINDORA sound error:", error);
  });
}

function ChronicleLogo() {
  return (
    <div className="logo-stage">
      <div className="logo-glow" />

      <svg
        className="main-logo"
        viewBox="0 0 320 320"
        role="img"
        aria-label="Chronicle waveform logo"
      >
        <circle cx="160" cy="160" r="70" fill="white" />

        <path
          d="M111 160 L122 160 L130 155 L138 164 L146 151 L153 175 L160 132 L168 183 L176 145 L183 164 L190 153 L198 160 L210 160"
          fill="none"
          stroke="#ed174c"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function DetectiveIcon() {
  return (
    <svg viewBox="0 0 64 64" className="detective-icon"
      fill="none" stroke="white" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      aria-label="Chronicle">
      <path d="M12 27 L17 23 L21 11 L30 15 L36 10 L44 15 L47 24 L53 27 L55 34 L9 34 Z" />
      <path d="M14 34 L50 34" />
      <circle cx="22" cy="44" r="8" />
      <circle cx="42" cy="44" r="8" />
      <path d="M30 43 L34 43 M14 43 L8 39 M50 43 L56 39 M29 24 L38 24" />
    </svg>
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

function ListeningAnimation({ stream }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass || !ctx) return;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.78;

    const microphone =
      audioContext.createMediaStreamSource(stream);

    microphone.connect(analyser);

    const frequencyData = new Uint8Array(
      analyser.frequencyBinCount
    );

    const barCount = 180;
    const smoothValues = new Array(barCount).fill(0);

    let animationFrame;
    let active = true;

    const center = 160;
    const baseRadius = 91;

    function draw() {
      if (!active) return;

      animationFrame = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(frequencyData);

      ctx.clearRect(0, 0, 320, 320);

      const glow = ctx.createRadialGradient(
        center, center, 65,
        center, center, 145
      );

      glow.addColorStop(0, "rgba(237,23,76,0)");
      glow.addColorStop(0.7, "rgba(237,23,76,0.06)");
      glow.addColorStop(1, "rgba(237,23,76,0)");

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 320, 320);

      for (let i = 0; i < barCount; i++) {
        const angle =
          (i / barCount) * Math.PI * 2 - Math.PI / 2;

        const dataIndex = Math.floor(
          (i / barCount) * frequencyData.length * 0.75
        );

        const volume = frequencyData[dataIndex] / 255;

        smoothValues[i] +=
          (volume - smoothValues[i]) * 0.22;

        const amplitude = smoothValues[i];
        const variation = 2 + Math.sin(i * 0.31) * 1.5;
        const barLength = variation + amplitude * 27;

        const x1 =
          center + Math.cos(angle) * baseRadius;
        const y1 =
          center + Math.sin(angle) * baseRadius;

        const x2 =
          center + Math.cos(angle) * (baseRadius + barLength);
        const y2 =
          center + Math.sin(angle) * (baseRadius + barLength);

        const hue = 345 + Math.sin(i * 0.035) * 13;
        const lightness = 38 + amplitude * 25;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle =
          `hsl(${hue}, 95%, ${lightness}%)`;

        ctx.lineWidth = i % 4 === 0 ? 1.8 : 1.2;
        ctx.lineCap = "round";
        ctx.shadowColor = "#ff174c";
        ctx.shadowBlur = amplitude > 0.08 ? 8 : 3;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(center, center, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,40,90,0.45)";
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(console.error);
    }

    draw();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrame);
      microphone.disconnect();
      analyser.disconnect();

      if (audioContext.state !== "closed") {
        audioContext.close().catch(console.error);
      }
    };
  }, [stream]);

  return (
    <div className="listening-visual">
      <div className="visualizer-stage">
        <canvas
          ref={canvasRef}
          width="320"
          height="320"
          className="visualizer-canvas"
        />

        <svg className="findora-logo" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="70" fill="white" />
          <path
            d="M111 160 L122 160 L130 155 L138 164 L146 151 L153 175 L160 132 L168 183 L176 145 L183 164 L190 153 L198 160 L210 160"
            fill="none"
            stroke="#ed174c"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="listening-info">
        <h2>Listening for music</h2>
        <p>Make sure your device can hear the song clearly</p>

        <div className="small-bars">
          {[8, 14, 20, 12, 17].map((height, index) => (
            <span
              key={index}
              style={{
                height: `${height}px`,
                animationDelay: `${index * 0.12}s`,
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
  const [micStream, setMicStream] = useState(null);
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const fileInputRef = useRef(null);

  async function handleVoiceClick() {
    if (listening) {
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
      }

      setMicStream(null);
      setListening(false);
      playFindoraSound("off");
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is unavailable.");
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });

      setMicStream(stream);
      setListening(true);
      playFindoraSound("on");
    } catch (error) {
      console.error("Microphone error:", error);

      alert(
        "Please allow microphone access to use the listening feature."
      );
    }
  }

  useEffect(() => {
    return () => {
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [micStream]);

  function stopListening() {
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
    }

    setMicStream(null);
    setListening(false);
    playFindoraSound("off");
  }

  function chooseShortcut(text) {
    setMessage(text);
  }

  function addEmoji() {
    setMessage((previous) => previous + "🙂");
  }

  return (
    <main className={`chronicle-app ${listening ? "is-listening" : ""}`}>

      <header className="chronicle-header">
        <button
          className="header-button menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="header-mark">
          <DetectiveIcon />
        </div>
      </header>

      {menuOpen && (
        <div className="menu-panel">
          <strong>CHRONICLE</strong>
          <button onClick={() => setMenuOpen(false)}>Home</button>
          <button onClick={() => setMenuOpen(false)}>Close menu</button>
        </div>
      )}

      {!listening ? (
        <>
          <section className="home-center">
            <ChronicleLogo />
          </section>

          <section className="quick-actions">
            <button
              className="quick-action"
              onClick={() => chooseShortcut("Create an image")}
            >
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <rect x="3" y="4" width="26" height="24" rx="3" />
                <circle cx="21" cy="11" r="3" />
                <path d="M4 24 L12 15 L19 22 L23 18 L29 25" />
              </svg>
              <span>Create an image</span>
            </button>

            <button
              className="quick-action"
              onClick={() => chooseShortcut("Translate language")}
            >
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M3 4 H22 V19 H14 L8 25 V19 H3 Z" />
                <path d="M12 11 H26 V22 H22 V28 L16 22 H12" />
                <path d="M8 9 H17 M12 7 V9 M10 12 Q12 16 17 17" />
              </svg>
              <span>Translate language</span>
            </button>

            <button
              className="quick-action"
              onClick={() => chooseShortcut("Search the web")}
            >
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <circle cx="16" cy="16" r="13" />
                <path d="M3 16 H29 M16 3 C8 10 8 22 16 29 M16 3 C24 10 24 22 16 29" />
              </svg>
              <span>Search the web</span>
            </button>
          </section>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden-file-input"
            onChange={(event) =>
              setAttachedFile(event.target.files?.[0] || null)
            }
          />

          <footer className="ask-bar">
            <button
              className="plus-button"
              aria-label="Add image"
              onClick={() => fileInputRef.current?.click()}
            >
              +
            </button>

            <input
              className="ask-input"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                attachedFile
                  ? attachedFile.name
                  : "Ask Chronicle"
              }
              aria-label="Message"
            />

            <button
              className="small-tool emoji-button"
              aria-label="Add emoji"
              onClick={addEmoji}
            >
              ☺
            </button>

            <button
              className="small-tool mic-button"
              onClick={handleVoiceClick}
              aria-label="Start microphone"
            >
              <svg viewBox="0 0 24 24">
                <rect x="9" y="2" width="6" height="13" rx="3" />
                <path d="M5 11 V13 A7 7 0 0 0 19 13 V11 M12 20 V23 M8 23 H16" />
              </svg>
            </button>

            <button
              className="voice-button"
              onClick={handleVoiceClick}
            >
              <MiniWave />
              <span>Voice</span>
            </button>
          </footer>
        </>
      ) : (
        <>
          <section className="listening-center">
            <ListeningAnimation stream={micStream} />
          </section>

          <section className="listening-controls">
            <button
              className="stop-button"
              onClick={stopListening}
            >
              Stop listening
            </button>
          </section>
        </>
      )}
    </main>
  );
}
