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
        <ellipse
          cx="160"
          cy="160"
          rx="70"
          ry="54"
          fill="white"
        />

        <path
          d="M111 160 L122 160 L130 155 L138 164 L146 151 L153 175 L160 132 L168 183 L176 145 L183 164 L190 153 L198 160 L210 160"
          fill="none"
          stroke="#ed174c"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
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
        center,
        center,
        65,
        center,
        center,
        145
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

        <svg
          className="findora-logo"
          viewBox="0 0 320 320"
          aria-label="Findora waveform logo"
        >
          <ellipse
            cx="160"
            cy="160"
            rx="70"
            ry="54"
            fill="white"
          />

          <path
            d="M111 160 L122 160 L130 155 L138 164 L146 151 L153 175 L160 132 L168 183 L176 145 L183 164 L190 153 L198 160 L210 160"
            fill="none"
            stroke="#ed174c"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="listening-info">
        <h2>Listening for music</h2>
        <p>
          Make sure your device can hear the song
          <br />
          clearly
        </p>

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

  return (
    <main className={`chronicle-app ${listening ? "is-listening" : ""}`}>
      <header className="chronicle-header">
        <button className="header-button menu-button" aria-label="Menu">
          ☰
        </button>

        <div className="header-brand">FINDORA</div>

        <button className="header-button phone-button" aria-label="Phone">
          ♧
        </button>
      </header>

      {!listening ? (
        <>
          <section className="home-center">
            <ChronicleLogo />

            <h1>Find your music</h1>
            <p className="home-subtitle">
              Discover songs from videos and sounds
            </p>
          </section>

          <section className="home-actions">
            <button className="action-card">
              <span className="action-icon pink-icon">♫</span>
              <span>Find a song</span>
            </button>

            <button className="action-card">
              <span className="action-icon red-icon">▣</span>
              <span>Search a video</span>
            </button>

            <button className="action-card">
              <span className="action-icon light-icon">✧</span>
              <span>Explore music</span>
            </button>
          </section>

          <footer className="ask-bar">
            <button className="plus-button" aria-label="Add">
              +
            </button>

            <input
              className="ask-input"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask Chronicle..."
              aria-label="Message"
            />

            <button className="small-tool" aria-label="Emoji">
              ☺
            </button>

            <button
              className="small-tool"
              onClick={handleVoiceClick}
              aria-label="Start microphone"
            >
              🎙
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
              onClick={handleVoiceClick}
            >
              Stop listening
            </button>
          </section>
        </>
      )}
    </main>
  );
}
