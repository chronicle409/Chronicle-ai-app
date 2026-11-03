
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame = 0;

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      frame += 0.018;

      const analyser = audioRef.current;
      let volume = 0;

      if (analyser && recording) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        volume = data.reduce((a, b) => a + b, 0) /
          data.length / 255;
      }

      for (let layer = 0; layer < 5; layer++) {
        ctx.beginPath();

        for (let x = 0; x <= w; x += 3) {
          const center = h / 2;
          const wave =
            Math.sin(x * 0.018 + frame + layer * 0.45) *
            (18 + volume * 65) +
            Math.sin(x * 0.035 - frame * 1.4) * 12;

          const y = center + wave * (1 - layer * 0.12);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(255,255,255,${0.7 - layer * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [recording]);

  async function toggleRecording() {
    if (recording) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      audioRef.current = null;
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;
      source.connect(analyser);

      streamRef.current = stream;
      audioRef.current = analyser;
      setRecording(true);
    } catch (error) {
      alert("Please allow microphone access to start recording.");
    }
  }

  return (
    <main style={styles.app}>
      <header style={styles.header}>
        <h2>Search</h2>
        <button style={styles.menu}>☰</button>
      </header>

      <section style={styles.center}>
        <div
          style={styles.waveContainer}
          onClick={toggleRecording}
        >
          <canvas
            ref={canvasRef}
            width="600"
            height="300"
            style={styles.canvas}
          />

          <img
            src="/findora-logo.png"
            alt="FINDORA logo"
            style={styles.logo}
          />
        </div>
      </section>

      <footer style={styles.footer}>
        {[0, 1, 2].map((dot) => (
          <button
            key={dot}
            onClick={() => setPage(dot)}
            style={{
              ...styles.dot,
              opacity: page === dot ? 1 : 0.4,
              transform: page === dot ? "scale(1.3)" : "scale(1)"
            }}
          />
        ))}
      </footer>
    </main>
  );
}

const styles = {
  app: {
    minHeight: "100dvh",
    width: "100%",
    background: "#1598F7",
    color: "white",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "22px 25px"
  },
  menu: {
    background: "transparent",
    color: "white",
    border: "none",
    fontSize: "30px",
    cursor: "pointer"
  },
  center: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  waveContainer: {
    width: "100%",
    maxWidth: "650px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    touchAction: "manipulation"
  },
  canvas: {
    width: "100%",
    height: "auto"
  },
  logo: {
    position: "absolute",
    width: "125px",
    height: "125px",
    objectFit: "contain",
    pointerEvents: "none"
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    padding: "30px"
  },
  dot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    border: "none",
    background: "white",
    cursor: "pointer",
    transition: "0.25s"
  }
};
