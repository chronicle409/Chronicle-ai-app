
import { useState, useEffect, useRef } from "react";
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
  findoraAudio.play().catch(console.error);
}

function ChronicleLogo() {
  return (
    <div className="voice-circle">
      <svg viewBox="0 0 120 60">
        <path
          d="M5 30 L20 30 L29 19 L38 43 L48 9 L59 52 L69 16 L80 39 L89 25 L99 30 L115 30"
          fill="none"
          stroke="#ed174c"
          strokeWidth="4"
          strokeLinecap="round"
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

/* REAL MICROPHONE-REACTIVE CIRCULAR VISUALIZER */

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
    analyser.smoothingTimeConstant = 0.78;

    const microphone =
      audioContext.createMediaStreamSource(stream);

    microphone.connect(analyser);

    const frequencyData = new Uint8Array(
      analyser.frequencyBinCount
    );

    let animationFrame;
    let smoothValues = new Array(180).fill(0);

    const center = 160;
    const baseRadius = 91;
    const barCount = 180;

    function draw() {
      animationFrame = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(frequencyData);

      ctx.clearRect(0, 0, 320, 320);

      /* Subtle circular glow */

      const glow = ctx.createRadialGradient(
        center, center, 65,
        center, center, 125
      );

      glow.addColorStop(0, "rgba(237,23,76,0)");
      glow.addColorStop(0.75, "rgba(237,23,76,0.035)");
      glow.addColorStop(1, "rgba(237,23,76,0)");

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 320, 320);

      /* Circular audio spectrum */

      for (let i = 0; i < barCount; i++) {
        const angle =
          (i / barCount) * Math.PI * 2 -
          Math.PI / 2;

        const dataIndex = Math.floor(
          (i / barCount) * frequencyData.length * 0.75
        );

        const volume = frequencyData[dataIndex] / 255;

        /* Smooth movement */

        smoothValues[i] +=
          (volume - smoothValues[i]) * 0.22;

        const amplitude = smoothValues[i];

        const variation =
          2 +
          Math.sin(i * 0.31) * 1.5;

        const barLength =
          variation + amplitude * 27;

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

        /* Different red shades around the circle */

        const hue =
          345 + Math.sin(i * 0.035) * 13;

        const saturation =
          90 + amplitude * 10;

        const lightness =
          38 + amplitude * 25;

        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle =
          `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        ctx.lineWidth = i % 4 === 0 ? 1.8 : 1.2;
        ctx.lineCap = "round";

        ctx.shadowColor = "#ff174c";
        ctx.shadowBlur = amplitude > 0.08 ? 8 : 3;

        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      /* Fine outer circular line */

      ctx.beginPath();
      ctx.arc(center, center, baseRadius, 0, Math.PI * 2);

      ctx.strokeStyle = "rgba(255,40,90,0.45)";
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      microphone.disconnect();
      audioContext.close();
    };
  }, [stream]);

  return (
    <div className="findora-animation">

      <div className="findora-visualizer-stage">

        {/* Animated spectrum */}

        <canvas
          ref={canvasRef}
          width="320"
          height="320"
          className="findora-spectrum-canvas"
        />

        {/* YOUR ORIGINAL WHITE OVAL LOGO */}

        <svg
          className="findora-logo-overlay"
          viewBox="0 0 320 320"
        >
          <ellipse
            cx="160"
            cy="160"
            rx="70"
            ry="54"
            fill="#ffffff"
          />

          {/* Original pink waveform */}

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

      </div>

      <div className="findora-listening-text">
        <h3>Listening for music</h3>

        <p>
          Make sure your device can hear the song
          <br />
          clearly
        </p>

        <div className="bottom-audio-bars">
          {[8, 14, 20, 12, 17].map((height, i) => (
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

      <style>{`

        .findora-animation {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .findora-visualizer-stage {
          position: relative;
          width: min(76vw, 300px);
          aspect-ratio: 1;
        }

        .findora-spectrum-canvas,
        .findora-logo-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .findora-spectrum-canvas {
          overflow: visible;
        }

        .findora-logo-overlay {
          pointer-events: none;
        }

        .findora-listening-text {
          color: white;
          text-align: center;
          margin-top: 0;
        }

        .findora-listening-text h3 {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .findora-listening-text p {
          font-size: 9px;
          line-height: 1.5;
          margin: 0;
          color: #eeeeee;
        }

        .bottom-audio-bars {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 25px;
          margin-top: 15px;
        }

        .bottom-audio-bars span {
          width: 3px;
          border-radius: 5px;
          background: #ff315e;
          animation: bottomBarPulse
            0.7s ease-in-out infinite alternate;
        }

        @keyframes bottomBarPulse {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }

      `}</style>

    </div>
  );
}

export default function App() {
  const [listening, setListening] = useState(false);
  const [micStream, setMicStream] = useState(null);

  async function handleVoiceClick() {
    if (listening) {
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
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
            autoGainControl: false
          }
        });

      setMicStream(stream);
      setListening(true);
      playFindoraSound("on");

    } catch (error) {
      console.error("Microphone error:", error);

      alert(
        "Please allow microphone access to use Chronicle listening animation."
      );
    }
  }

  return (
    <main
      className={`chronicle-app ${
        listening ? "is-listening" : ""
      }`}
    >

      <header className="chronicle-header">
        <button className="header-button">☰</button>
        <button className="header-button">☏</button>
      </header>

      <section className="visualizer-container">
        {listening ? (
          <ListeningAnimation stream={micStream} />
        ) : (
          <ChronicleLogo />
        )}
      </section>

      {!listening ? (
        <>
          <section className="home-actions">
            <button>▧　Create an image</button>
            <button>文　Translate language</button>
            <button>◎　Search the web</button>
          </section>

          <footer className="ask-bar">
            <button className="plus-button">+</button>

            <span className="ask-placeholder">
              Ask Chronicle
            </span>

            <button className="small-tool">☺</button>
            <button className="small-tool">🎙</button>

            <button
              className="voice-button"
              onClick={handleVoiceClick}
            >
              <MiniWave />
              Voice
            </button>
          </footer>
        </>
      ) : (
        <section className="listening-controls">
          <button
            className="stop-button"
            onClick={handleVoiceClick}
          >
            Stop listening
          </button>
        </section>
      )}

    </main>
  );
}
