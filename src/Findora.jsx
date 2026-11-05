
import { useState, useEffect, useRef } from "react";

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
  findoraAudio.play().catch(console.error);
}

/* ORIGINAL WHITE OVAL LOGO */

function FindoraLogo() {
  return (
    <svg viewBox="0 0 320 320" className="findora-logo">
      <ellipse
        cx="160"
        cy="160"
        rx="70"
        ry="54"
        fill="white"
      />

      <path
        d="
          M111 160
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
          L210 160
        "
        fill="none"
        stroke="#ed174c"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* REAL MICROPHONE AUDIO VISUALIZER */

function ListeningAnimation({ stream }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;

    const microphone =
      audioContext.createMediaStreamSource(stream);

    microphone.connect(analyser);

    const frequencyData = new Uint8Array(
      analyser.frequencyBinCount
    );

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = 360 * dpr;
    canvas.height = 360 * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const center = 180;
    const baseRadius = 112;
    const barCount = 180;

    let smoothValues = new Array(barCount).fill(0);
    let animationFrame;

    async function startAudio() {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
    }

    startAudio();

    function draw() {
      animationFrame = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(frequencyData);

      ctx.clearRect(0, 0, 360, 360);

      /* Circular spectrum bars */

      for (let i = 0; i < barCount; i++) {
        const angle =
          (i / barCount) * Math.PI * 2 - Math.PI / 2;

        const dataIndex = Math.floor(
          (i / barCount) * frequencyData.length * 0.8
        );

        const volume = frequencyData[dataIndex] / 255;

        smoothValues[i] +=
          (volume - smoothValues[i]) * 0.22;

        const amplitude = smoothValues[i];

        const barLength =
          3 + amplitude * 48 +
          Math.sin(i * 0.3) * 1.5;

        const innerRadius = baseRadius;
        const outerRadius = baseRadius + barLength;

        const x1 =
          center + Math.cos(angle) * innerRadius;

        const y1 =
          center + Math.sin(angle) * innerRadius;

        const x2 =
          center + Math.cos(angle) * outerRadius;

        const y2 =
          center + Math.sin(angle) * outerRadius;

        /* Cyan, turquoise and purple */

        const hue =
          175 + (i / barCount) * 105;

        const lightness = 48 + amplitude * 18;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle =
          `hsl(${hue}, 100%, ${lightness}%)`;

        ctx.lineWidth = i % 3 === 0 ? 2 : 1.4;
        ctx.lineCap = "round";

        ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
        ctx.shadowBlur = amplitude > 0.06 ? 6 : 2;

        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      /* Inner circular glow */

      const glow = ctx.createRadialGradient(
        center, center, 75,
        center, center, 125
      );

      glow.addColorStop(0, "rgba(0,0,0,0)");
      glow.addColorStop(0.8, "rgba(0,220,255,0.04)");
      glow.addColorStop(1, "rgba(130,50,255,0.08)");

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 360, 360);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      microphone.disconnect();
      audioContext.close();
    };
  }, [stream]);

  return (
    <div className="visualizer-stage">
      <canvas
        ref={canvasRef}
        className="spectrum-canvas"
      />

      <FindoraLogo />
    </div>
  );
}

export default function Findora() {
  const [listening, setListening] = useState(false);
  const [micStream, setMicStream] = useState(null);
  const [error, setError] = useState("");

  async function startListening() {
    setError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is not supported.");
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });

      setMicStream(stream);
      setListening(true);
      playFindoraSound("on");

    } catch (err) {
      console.error("Microphone error:", err);
      setError("Please allow microphone access and try again.");
    }
  }

  function stopListening() {
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
    }

    setMicStream(null);
    setListening(false);
    playFindoraSound("off");
  }

  useEffect(() => {
    return () => {
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [micStream]);

  return (
    <main className="findora-app">

      <header className="findora-header">
        <span>FINDORA</span>
        <span className="header-wave">〰</span>
      </header>

      <section className="main-visualizer">

        {listening ? (
          <ListeningAnimation stream={micStream} />
        ) : (
          <div className="visualizer-stage">
            <FindoraLogo />
          </div>
        )}

        {listening && (
          <div className="listening-info">
            <h2>Listening for music</h2>
            <p>
              Make sure your device can hear the song
              <br />
              clearly
            </p>

            <div className="bottom-bars">
              {[8, 15, 22, 14, 25].map((height, i) => (
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
        )}

      </section>

      {error && <p className="error-message">{error}</p>}

      <footer className="findora-controls">
        {listening ? (
          <button
            className="stop-button"
            onClick={stopListening}
          >
            Stop listening
          </button>
        ) : (
          <button
            className="start-button"
            onClick={startListening}
          >
            〰 Start listening
          </button>
        )}
      </footer>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .findora-app {
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          background: #000;
          color: white;
          font-family: Arial, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .findora-header {
          position: absolute;
          top: 35px;
          left: 25px;
          right: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 19px;
          font-weight: bold;
          letter-spacing: 3px;
        }

        .header-wave {
          font-size: 30px;
          color: #42dfff;
        }

        .main-visualizer {
          position: absolute;
          top: 39%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .visualizer-stage {
          position: relative;
          width: min(88vw, 360px);
          aspect-ratio: 1;
        }

        .spectrum-canvas,
        .findora-logo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .findora-logo {
          pointer-events: none;
        }

        .listening-info {
          text-align: center;
          margin-top: 25px;
        }

        .listening-info h2 {
          font-size: 19px;
          margin: 0 0 12px;
        }

        .listening-info p {
          color: #ddd;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }

        .bottom-bars {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 30px;
          margin-top: 25px;
        }

        .bottom-bars span {
          width: 5px;
          border-radius: 10px;
          background: #42dfff;
          animation: pulse 0.65s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }

        .findora-controls {
          position: absolute;
          bottom: 8%;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
        }

        .start-button,
        .stop-button {
          min-width: 235px;
          min-height: 65px;
          padding: 15px 30px;
          border: none;
          border-radius: 45px;
          background: linear-gradient(110deg, #00c9d8, #743cff);
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
        }

        .stop-button {
          background: linear-gradient(110deg, #00c9d8, #743cff);
        }

        .error-message {
          position: absolute;
          bottom: 19%;
          left: 10%;
          right: 10%;
          text-align: center;
          color: #ff7777;
          font-size: 13px;
        }
      `}</style>

    </main>
  );
}
