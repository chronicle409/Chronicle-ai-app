
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Ready to listen");

  const COUNT = 180;
  const SIZE = 390;
  const CENTER = 195;

  // Draw the animated circular waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const smooth = new Array(COUNT).fill(0);
    let frame;

    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);

      const analyser = analyserRef.current;
      let data = null;

      if (analyser) {
        data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
      }

      const time = performance.now() / 1000;

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2;

        let sound = 0;

        if (data) {
          const index = Math.min(
            data.length - 1,
            Math.floor(2 + (i / COUNT) * 150)
          );

          sound = data[index] / 255;
        }

        smooth[i] += (sound - smooth[i]) * 0.3;

        const length = analyser
          ? 5 + smooth[i] * 75
          : 5 + Math.sin(time * 1.5 + i * 0.1) * 2;

        const inner = 135;
        const outer = inner + length;

        const x1 = CENTER + Math.cos(angle) * inner;
        const y1 = CENTER + Math.sin(angle) * inner;
        const x2 = CENTER + Math.cos(angle) * outer;
        const y2 = CENTER + Math.sin(angle) * outer;

        const hue = (i * 360 / COUNT + time * 45) % 360;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = analyser
          ? `hsl(${hue}, 100%, 72%)`
          : "#ffffff";

        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.shadowBlur = analyser ? 13 : 5;
        ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      [103, 124].forEach((radius) => {
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, radius, 0, Math.PI * 2);
        ctx.setLineDash([1, 5]);
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      ctx.setLineDash([]);

      frame = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(frame);
  }, []);

  // Start microphone
  async function startListening() {
    setStatus("Button working! Requesting microphone...");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone unavailable. Open FINDORA using HTTPS in Chrome."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("Audio processing is not supported.");
      }

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      await audioContext.resume();

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.75;

      source.connect(analyser);

      analyserRef.current = analyser;

      setListening(true);
      setStatus("Listening... Speak now!");

    } catch (error) {
      console.error("FINDORA microphone error:", error);

      stopListening(
        "Microphone error: " + error.message
      );
    }
  }

  // Stop microphone
  function stopListening(message = "Ready to listen") {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;

    setListening(false);
    setStatus(message);
  }

  function toggleMicrophone() {
    if (listening) {
      stopListening("Microphone stopped.");
    } else {
      startListening();
    }
  }

  // Clean up when the component closes
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.search}>⌕ Search</div>
        <button style={styles.menu} aria-label="Menu">
          ☰
        </button>
      </header>

      <section style={styles.center}>
        <button
          type="button"
          onClick={toggleMicrophone}
          style={styles.waveButton}
          aria-label="Toggle microphone"
        >
          <canvas
            ref={canvasRef}
            style={styles.canvas}
          />
        </button>

        <p style={styles.status} aria-live="polite">
          {status}
        </p>

        <button
          type="button"
          onClick={toggleMicrophone}
          style={{
            ...styles.micButton,
            ...(listening ? styles.activeMic : {})
          }}
          aria-label={listening ? "Stop microphone" : "Start microphone"}
        >
          {listening ? "■" : "🎤"}
        </button>
      </section>

      <footer style={styles.dots}>
        <span style={styles.activeDot}></span>
        <span style={styles.dot}></span>
        <span style={styles.dot}></span>
      </footer>
    </main>
  );
}

const styles = {
  page: {
    background: "#087ff5",
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Arial, sans-serif",
    overflow: "hidden"
  },

  header: {
    height: "65px",
    minHeight: "65px",
    padding: "0 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white"
  },

  search: {
    fontSize: "23px",
    fontWeight: "bold"
  },

  menu: {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "30px",
    cursor: "pointer"
  },

  center: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },

  waveButton: {
    width: "min(85vw, 350px)",
    aspectRatio: "1",
    border: "none",
    padding: 0,
    background: "transparent",
    cursor: "pointer",
    touchAction: "manipulation"
  },

  canvas: {
    width: "100%",
    height: "100%",
    display: "block",
    pointerEvents: "none"
  },

  status: {
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "10px 15px 18px",
    minHeight: "20px"
  },

  micButton: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    border: "3px solid white",
    background: "#0865d9",
    color: "white",
    fontSize: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    touchAction: "manipulation",
    boxShadow: "0 0 20px rgba(255,255,255,0.35)"
  },

  activeMic: {
    background: "white",
    color: "#087ff5"
  },

  dots: {
    height: "45px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px"
  },

  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.4)"
  },

  activeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "white"
  }
};
