
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const [listening, setListening] = useState(false);

  const SIZE = 420;
  const CENTER = SIZE / 2;
  const COUNT = 220;

  // Draw the glowing waveform animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const smooth = new Array(COUNT).fill(0);
    const audioData = new Uint8Array(1024);

    let animationFrame;

    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);

      const analyser = analyserRef.current;

      if (analyser) {
        analyser.getByteFrequencyData(audioData);
      }

      const time = performance.now() / 1000;

      // Circular waveform bars
      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2;

        // Four large moving wave peaks
        const wave =
          Math.pow((1 + Math.sin(angle * 4 - time * 2)) / 2, 2);

        let sound = 0;

        if (analyser) {
          const index = Math.min(
            audioData.length - 1,
            Math.floor(2 + (i / COUNT) * 250)
          );

          sound = audioData[index] / 255;
        }

        smooth[i] += (sound - smooth[i]) * 0.25;

        const idleLength = 9 + wave * 32;

        const barLength = analyser
          ? idleLength + smooth[i] * 55
          : idleLength;

        const innerRadius = 145;
        const outerRadius = innerRadius + barLength;

        const x1 = CENTER + Math.cos(angle) * innerRadius;
        const y1 = CENTER + Math.sin(angle) * innerRadius;

        const x2 = CENTER + Math.cos(angle) * outerRadius;
        const y2 = CENTER + Math.sin(angle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = "rgba(255,255,255,0.98)";
        ctx.lineWidth = 3.2;
        ctx.lineCap = "round";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(255,255,255,0.95)";
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Glowing circular rings
      [118, 140].forEach((radius) => {
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 9;
        ctx.shadowColor = "white";
        ctx.stroke();
      });

      ctx.shadowBlur = 0;

      animationFrame = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  async function startMicrophone() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is unavailable.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      await audioContext.resume();

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.7;

      source.connect(analyser);
      analyserRef.current = analyser;

      setListening(true);
    } catch (error) {
      console.error("FINDORA microphone error:", error);
      alert("Microphone error: " + error.message);
      stopMicrophone();
    }
  }

  function stopMicrophone() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setListening(false);
  }

  function toggleMicrophone() {
    if (listening) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  }

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
    <main style={styles.page}>

      <header style={styles.header}>
        <div style={styles.search}>⌕ Search</div>
        <div style={styles.menu}>☰</div>
      </header>

      <section style={styles.center}>

        <button
          type="button"
          onClick={toggleMicrophone}
          style={styles.waveButton}
          aria-label={listening ? "Stop listening" : "Start listening"}
        >
          <canvas
            ref={canvasRef}
            style={styles.canvas}
          />

          <img
            src="/findora-logo.jpg"
            alt="FINDORA"
            style={styles.logo}
          />
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
    width: "100%",
    height: "100dvh",
    minHeight: "100vh",
    background: "#1598F7",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif"
  },

  header: {
    height: "75px",
    minHeight: "75px",
    padding: "0 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white"
  },

  search: {
    fontSize: "25px",
    fontWeight: "bold"
  },

  menu: {
    fontSize: "34px",
    color: "white"
  },

  center: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  waveButton: {
    width: "min(94vw, 420px)",
    aspectRatio: "1 / 1",
    position: "relative",
    border: "none",
    padding: 0,
    background: "transparent",
    cursor: "pointer",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent"
  },

  canvas: {
    width: "100%",
    height: "100%",
    display: "block",
    pointerEvents: "none"
  },

  logo: {
    position: "absolute",
    width: "31%",
    height: "31%",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    objectFit: "contain",
    mixBlendMode: "screen",
    pointerEvents: "none"
  },

  dots: {
    height: "65px",
    minHeight: "65px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "17px"
  },

  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.35)"
  },

  activeDot: {
    width: "13px",
    height: "13px",
    borderRadius: "50%",
    background: "white",
    boxShadow: "0 0 15px white"
  }
};
