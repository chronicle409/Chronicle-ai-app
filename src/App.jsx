
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const audioDataRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width, height, animation;
    let time = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.43;
      const radius = Math.min(width, height) * 0.235;
      const count = 200;

      // Soft blue-white glow
      const glow = ctx.createRadialGradient(
        cx, cy, radius * 0.5,
        cx, cy, radius * 1.65
      );
      glow.addColorStop(0, "rgba(255,255,255,0.16)");
      glow.addColorStop(0.6, "rgba(255,255,255,0.05)");
      glow.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.65, 0, Math.PI * 2);
      ctx.fill();

      // Circular dotted inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.80, 0, Math.PI * 2);
      ctx.setLineDash([1, 4]);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner circular outline
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.91, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      const analyser = analyserRef.current;
      const data = audioDataRef.current;

      if (analyser && data) {
        analyser.getByteFrequencyData(data);
      }

      // Organic circular waveform
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;

        const wave1 = Math.sin(angle * 3 + time * 1.5);
        const wave2 = Math.sin(angle * 5 - time * 1.1);
        const wave3 = Math.sin(angle * 2 + time * 0.8);

        const organic = (
          wave1 * 0.5 +
          wave2 * 0.3 +
          wave3 * 0.2
        );

        let sound = 0;

        if (data) {
          const index = Math.floor(i / count * data.length);
          sound = data[index] / 255;
        }

        const length =
          radius * (
            0.12 +
            Math.max(0, organic + 0.35) * 0.35 +
            sound * 0.8
          );

        const inner = radius * 1.02;
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
        ctx.lineWidth = i % 3 === 0 ? 2.2 : 1.5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 7;
        ctx.shadowColor = "white";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animation = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
    };
  }, []);

  async function toggleRecording() {
    if (recording) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;

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
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      setRecording(true);
    } catch (error) {
      alert("Please allow microphone permission.");
    }
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <main style={styles.app}>
      <canvas ref={canvasRef} style={styles.canvas} />

      <header style={styles.header}>
        <button style={styles.search}>
          <span style={{ fontSize: 27 }}>⌕</span>
          Search
        </button>

        <button
          style={styles.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <div style={styles.menuPanel}>
          <div>Home</div>
          <div>Settings</div>
          <div>About</div>
        </div>
      )}

      <button
        style={styles.centerButton}
        onClick={toggleRecording}
        aria-label="Toggle microphone"
      >
        <img src="/findora-logo.png" alt="FINDORA" style={styles.logo} />
      </button>

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
    fontFamily: "Arial, sans-serif"
  },

  canvas: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none"
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "27px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 5
  },

  search: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: 17
  },

  menuButton: {
    width: 42,
    height: 42,
    background: "transparent",
    border: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 6
  },

  menuPanel: {
    position: "absolute",
    right: 22,
    top: 85,
    zIndex: 10,
    background: "#087DD0",
    color: "white",
    padding: 18,
    borderRadius: 12,
    display: "grid",
    gap: 18
  },

  centerButton: {
    position: "absolute",
    left: "50%",
    top: "43%",
    transform: "translate(-50%, -50%)",
    width: "min(39vw, 270px)",
    height: "min(39vw, 270px)",
    borderRadius: "50%",
    background: "white",
    border: "none",
    padding: "12%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(255,255,255,0.35)"
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12
  },

  activeDot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "white",
    boxShadow: "0 0 12px white"
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.4)"
  }
};
