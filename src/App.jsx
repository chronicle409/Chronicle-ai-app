
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Circular audio visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animation;
    let width = 0;
    let height = 0;
    let time = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      time += 0.018;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.43;
      const radius = Math.min(width, height) * 0.205;

      const bars = 144;

      const analyser = analyserRef.current;
      const data = dataRef.current;

      if (analyser && data) {
        analyser.getByteFrequencyData(data);
      }

      // Outer radial waveform
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2;

        const wave =
          Math.sin(angle * 3 + time * 1.5) * 0.45 +
          Math.sin(angle * 5 - time) * 0.3 +
          Math.sin(angle * 2 + time * 0.7) * 0.25;

        let sound = 0;

        if (data) {
          const index = Math.floor((i / bars) * data.length);
          sound = data[index] / 255;
        }

        const length =
          radius *
          (0.10 + Math.max(0, wave + 0.35) * 0.34 + sound * 0.65);

        const inner = radius * 1.08;
        const outer = inner + length;

        ctx.beginPath();

        ctx.moveTo(
          cx + Math.cos(angle) * inner,
          cy + Math.sin(angle) * inner
        );

        ctx.lineTo(
          cx + Math.cos(angle) * outer,
          cy + Math.sin(angle) * outer
        );

        ctx.strokeStyle = `rgba(255,255,255,${0.72 + sound * 0.28})`;
        ctx.lineWidth = i % 3 === 0 ? 2 : 1.4;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Inner circular rings
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.99, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animation = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Microphone on/off
  async function toggleRecording() {
    if (recording) {
      streamRef.current?.getTracks().forEach((track) => track.stop());

      streamRef.current = null;

      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      analyserRef.current = null;
      dataRef.current = null;

      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const AudioClass =
        window.AudioContext || window.webkitAudioContext;

      const audio = new AudioClass();
      const analyser = audio.createAnalyser();
      const source = audio.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;

      source.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audio;
      analyserRef.current = analyser;

      dataRef.current = new Uint8Array(
        analyser.frequencyBinCount
      );

      setRecording(true);
    } catch (error) {
      alert("Please allow microphone access.");
    }
  }

  // Clean up microphone
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <main style={styles.app}>
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Top buttons */}
      <header style={styles.header}>
        {/* Search icon only */}
        <button
          type="button"
          aria-label="Search"
          style={styles.topButton}
        >
          <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 5 5" />
          </svg>
        </button>

        {/* Three-line menu */}
        <button
          type="button"
          aria-label="Menu"
          style={styles.topButton}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span style={styles.menuLine} />
          <span style={styles.menuLine} />
          <span style={styles.menuLine} />
        </button>
      </header>

      {/* Menu panel */}
      {menuOpen && (
        <div style={styles.menuPanel}>
          <div>Home</div>
          <div>Settings</div>
          <div>About</div>
        </div>
      )}

      {/* Centre white circle and fitted logo */}
      <button
        type="button"
        onClick={toggleRecording}
        aria-label={recording ? "Stop listening" : "Start listening"}
        style={styles.centerButton}
      >
        <img
          src="/findora-logo.png"
          alt="FINDORA"
          style={styles.logo}
        />
      </button>

      {/* Three navigation dots */}
      <footer style={styles.footer}>
        <span style={styles.activeDot} />
        <span style={styles.dot} />
        <span style={styles.dot} />
      </footer>
    </main>
  );
}

const styles = {
  app: {
    position: "relative",
    width: "100%",
    height: "100dvh",
    minHeight: "500px",
    overflow: "hidden",
    background: "#1598F7",
    fontFamily: "Arial, sans-serif",
  },

  canvas: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },

  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "25px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 5,
  },

  // No circles around buttons
  topButton: {
    width: "44px",
    height: "44px",
    border: "none",
    borderRadius: "0",
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: 0,
    cursor: "pointer",
  },

  menuLine: {
    display: "block",
    width: "25px",
    height: "2.5px",
    borderRadius: "3px",
    background: "white",
  },

  // Menu
  menuPanel: {
    position: "absolute",
    top: "80px",
    right: "25px",
    zIndex: 10,
    padding: "18px",
    display: "grid",
    gap: "18px",
    color: "white",
    background: "#087DD0",
    borderRadius: "12px",
  },

  // Centre circle
  centerButton: {
    position: "absolute",
    left: "50%",
    top: "43%",
    transform: "translate(-50%, -50%)",
    width: "min(39vw, 250px)",
    height: "min(39vw, 250px)",
    borderRadius: "50%",
    background: "white",
    border: "none",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 3,
    cursor: "pointer",
    boxShadow: "0 0 18px rgba(255,255,255,0.3)",
  },

  // Correct logo size
  logo: {
    width: "65%",
    height: "65%",
    objectFit: "contain",
    transform: "none",
  },

  // Bottom navigation
  footer: {
    position: "absolute",
    bottom: "30px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "13px",
    zIndex: 5,
  },

  activeDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "white",
    boxShadow: "0 0 10px white",
  },

  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.4)",
  },
};
