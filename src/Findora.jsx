
import { useState, useEffect, useRef } from "react";
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
  findoraAudio.play().catch(console.error);
}

/* Keep the white oval and pink waveform logo */

function FindoraLogo() {
  return (
    <svg className="findora-logo" viewBox="0 0 320 320">
      <ellipse
        cx="160"
        cy="160"
        rx="70"
        ry="54"
        fill="#fff"
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
  );
}

/* Circular microphone visualizer */

function ListeningAnimation({ stream }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stream) return;

    const ctx = canvas.getContext("2d");
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.85;

    const microphone =
      audioContext.createMediaStreamSource(stream);

    microphone.connect(analyser);

    const frequencyData =
      new Uint8Array(analyser.frequencyBinCount);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = 360 * dpr;
    canvas.height = 360 * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const center = 180;
    const radius = 116;
    const barCount = 240;

    const smooth = new Array(barCount).fill(0);

    let frame;
    let active = true;

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    function draw() {
      if (!active) return;

      frame = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(frequencyData);

      const time = performance.now() * 0.001;

      ctx.clearRect(0, 0, 360, 360);

      /* Glowing gradient circle */

      const gradient = ctx.createLinearGradient(
        40, 300, 320, 40
      );

      gradient.addColorStop(0, "#00f5ce");
      gradient.addColorStop(0.35, "#00dfff");
      gradient.addColorStop(0.68, "#5965ff");
      gradient.addColorStop(1, "#d43cff");

      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#39dfff";
      ctx.shadowBlur = 13;
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* Three moving glowing sections */

      const colours = [
        "#00ffd5",
        "#b83cff",
        "#00dfff"
      ];

      for (let j = 0; j < 3; j++) {
        const rotation = time * 0.35 + j * 2.1;

        ctx.beginPath();
        ctx.arc(
          center,
          center,
          radius,
          rotation,
          rotation + 0.85
        );

        ctx.strokeStyle = colours[j];
        ctx.lineWidth = 3;
        ctx.shadowColor = colours[j];
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      /* 240 small microphone-reactive bars */

      for (let i = 0; i < barCount; i++) {
        const angle =
          (i / barCount) * Math.PI * 2 -
          Math.PI / 2;

        const index = Math.floor(
          (i / barCount) * frequencyData.length * 0.85
        );

        const volume = frequencyData[index] / 255;

        smooth[i] +=
          (volume - smooth[i]) * 0.20;

        const idleMotion =
          0.025 +
          (Math.sin(time * 2 + i * 0.12) + 1) * 0.015;

        const amplitude = Math.max(
          smooth[i],
          idleMotion
        );

        const length = 3 + amplitude * 43;

        const inner = radius + 5;
        const outer = inner + length;

        const x1 =
          center + Math.cos(angle) * inner;

        const y1 =
          center + Math.sin(angle) * inner;

        const x2 =
          center + Math.cos(angle) * outer;

        const y2 =
          center + Math.sin(angle) * outer;

        const hue = 175 + (i / barCount) * 110;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle =
          `hsl(${hue}, 100%, ${50 + amplitude * 18}%)`;

        ctx.lineWidth = i % 3 === 0 ? 1.8 : 1.2;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }

    draw();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      microphone.disconnect();
      audioContext.close();
    };
  }, [stream]);

  return (
    <div className="visualizer-stage">
      <canvas
        ref={canvasRef}
        className="visualizer-canvas"
      />
      <FindoraLogo />
    </div>
  );
}

export default function Findora() {
  const [listening, setListening] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState("");

  async function startListening() {
    setError("");

    try {
      const audioStream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });

      setStream(audioStream);
      setListening(true);
      playFindoraSound("on");

    } catch (err) {
      console.error(err);
      setError("Please allow microphone access.");
    }
  }

  function stopListening() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    setStream(null);
    setListening(false);
    playFindoraSound("off");
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <main className="findora-app">

      <header className="findora-header">
        <button className="menu-button">☰</button>
        <span className="header-phone">☏</span>
      </header>

      <section className="findora-main">

        <div className="visualizer-area">
          {listening ? (
            <ListeningAnimation stream={stream} />
          ) : (
            <div className="visualizer-stage">
              <FindoraLogo />
            </div>
          )}
        </div>

        {listening && (
          <div className="listening-info">
            <h2>Listening for music</h2>

            <p>
              Make sure your device can hear the song
              <br />
              clearly
            </p>

            <div className="small-bars">
              {[8, 14, 22, 15, 25].map((height, i) => (
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

      <footer className="findora-footer">
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
            Start listening
          </button>
        )}
      </footer>

    </main>
  );
}
