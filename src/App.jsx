
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const audioDataRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");

  // Draw the circular audio visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let time = 0;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      time += 0.012;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.52;
      const radius = Math.min(width, height) * 0.205;
      const barCount = 180;

      const analyser = analyserRef.current;
      const audioData = audioDataRef.current;

      // Soft outer glow
      const glow = ctx.createRadialGradient(
        cx, cy, radius * 0.6,
        cx, cy, radius * 1.65
      );

      glow.addColorStop(0, "rgba(255,255,255,0.08)");
      glow.addColorStop(0.55, "rgba(255,255,255,0.035)");
      glow.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.65, 0, Math.PI * 2);
      ctx.fill();

      // Two thin circular rings
      [0.91, 1.08].forEach((scale, index) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * scale, 0, Math.PI * 2);
        ctx.strokeStyle = index === 0
          ? "rgba(255,255,255,0.48)"
          : "rgba(255,255,255,0.22)";
        ctx.lineWidth = index === 0 ? 1.1 : 0.8;
        ctx.stroke();
      });

      // Circular radial audio bars
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;

        let audioLevel = 0;

        if (analyser && audioData) {
          const index = Math.floor(
            (i / barCount) * audioData.length
          );
          audioLevel = audioData[index] / 255;
        }

        const wave =
          Math.sin(time * 2.1 + i * 0.13) * 0.5 +
          Math.sin(time * 1.25 - i * 0.075) * 0.5;

        const idleMotion = 0.13 + (wave + 1) * 0.09;
        const activeMotion = audioLevel * 0.75;

        const barLength = radius * (
          0.035 + idleMotion + activeMotion
        );

        const innerRadius = radius * 1.12;
        const outerRadius = innerRadius + barLength;

        const x1 = cx + Math.cos(angle) * innerRadius;
        const y1 = cy + Math.sin(angle) * innerRadius;
        const x2 = cx + Math.cos(angle) * outerRadius;
        const y2 = cy + Math.sin(angle) * outerRadius;

        const brightness = 0.48 + audioLevel * 0.5;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = `rgba(255,255,255,${brightness})`;
        ctx.lineWidth = i % 4 === 0 ? 2 : 1.15;
        ctx.lineCap = "round";

        ctx.shadowBlur = audioLevel > 0.08 ? 9 : 4;
        ctx.shadowColor = "rgba(255,255,255,0.8)";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Small glowing highlights around the circle
      for (let i = 0; i < 8; i++) {
        const angle = time * 0.18 + (i / 8) * Math.PI * 2;
        const r = radius * 1.24;

        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "white";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (analyser && audioData) {
        analyser.getByteFrequencyData(audioData);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Start and stop microphone recording
  const toggleRecording = async () => {
    setError("");

    if (recording) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      analyserRef.current = null;
      audioDataRef.current = null;
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;

      source.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      audioDataRef.current = new Uint8Array(
        analyser.frequencyBinCount
      );

      setRecording(true);
    } catch (err) {
      setError("Microphone access was not granted. Please allow microphone permission.");
      setRecording(false);
    }
  };

  // Clean up microphone when leaving the page
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <main style={styles.app}>
      <canvas ref={canvasRef} style={styles.canvas} />

      <header style={styles.header}>
        <button style={styles.headerButton} type="button">
          <span style={styles.searchIcon}>⌕</span>
          Search
        </button>

        <button
          style={styles.menuButton}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <div style={styles.menuPanel}>
          <div style={styles.menuItem}>FINDORA</div>
          <div style={styles.menuItem}>Home</div>
          <div style={styles.menuItem}>Settings</div>
          <div style={styles.menuItem}>About</div>
        </div>
      )}

      <section style={styles.visualizerArea}>
        <button
          type="button"
          style={styles.centerButton}
          onClick={toggleRecording}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          <img
            src="/findora-logo.png"
            alt="FINDORA"
            style={styles.logo}
          />
        </button>

        <div style={styles.status}>
          {recording ? "LISTENING..." : "TAP TO SPEAK"}
        </div>

        {error && <div style={styles.error}>{error}</div>}
      </section>

      <footer style={styles.footer}>
        <div style={styles.dots}>
          <span style={styles.activeDot} />
          <span style={styles.dot} />
          <span style={styles.dot} />
        </div>
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
    color: "white",
    fontFamily: "Arial, sans-serif"
  },

  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none"
  },

  header: {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    padding: "25px 25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 5
  },

  headerButton: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "17px",
    cursor: "pointer"
  },

  searchIcon: {
    fontSize: "28px",
    lineHeight: 1
  },

  menuButton: {
    width: "43px",
    height: "43px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    background: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "50%",
    cursor: "pointer"
  },

  menuButtonSpan: {
    background: "white"
  },

  visualizerArea: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    zIndex: 2
  },

  centerButton: {
    position: "absolute",
    top: "52%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "125px",
    height: "125px",
    borderRadius: "50%",
    background: "transparent",
    border: "none",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 3,
    WebkitTapHighlightColor: "transparent"
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block"
  },

  status: {
    position: "absolute",
    top: "calc(52% + 155px)",
    fontSize: "11px",
    letterSpacing: "4px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)"
  },

  error: {
    position: "absolute",
    top: "calc(52% + 185px)",
    width: "85%",
    textAlign: "center",
    fontSize: "12px",
    color: "white"
  },

  menuPanel: {
    position: "absolute",
    top: "82px",
    right: "22px",
    width: "170px",
    padding: "12px",
    borderRadius: "14px",
    background: "rgba(0,65,130,0.92)",
    border: "1px solid rgba(255,255,255,0.25)",
    zIndex: 10
  },

  menuItem: {
    padding: "12px",
    color: "white",
    fontSize: "14px",
    borderBottom: "1px solid rgba(255,255,255,0.12)"
  },

  footer: {
    position: "absolute",
    bottom: "28px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    zIndex: 5
  },

  dots: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  activeDot: {
    width: "20px",
    height: "7px",
    borderRadius: "10px",
    background: "white"
  },

  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.5)"
  }
};
