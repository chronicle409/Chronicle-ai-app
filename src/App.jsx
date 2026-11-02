
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const [listening, setListening] = useState(false);

  const SIZE = 420;
  const CENTER = 210;
  const COUNT = 180;

  // Circular voice animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const smooth = new Array(COUNT).fill(0);
    const analyserData = new Uint8Array(1024);

    let animationFrame;

    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);

      const analyser = analyserRef.current;

      if (analyser) {
        analyser.getByteFrequencyData(analyserData);
      }

      const time = performance.now() / 1000;

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2;

        let sound = 0;

        if (analyser) {
          const index = Math.min(
            analyserData.length - 1,
            Math.floor(2 + Math.pow(i / COUNT, 1.5) * 250)
          );

          sound = analyserData[index] / 255;
        }

        smooth[i] += (sound - smooth[i]) * 0.25;

        const idleMovement =
          3 + Math.sin(time * 2 + i * 0.12) * 2;

        const barLength = analyser
          ? 5 + smooth[i] * 95
          : idleMovement;

        const innerRadius = 145;
        const outerRadius = innerRadius + barLength;

        const x1 =
          CENTER + Math.cos(angle) * innerRadius;
        const y1 =
          CENTER + Math.sin(angle) * innerRadius;

        const x2 =
          CENTER + Math.cos(angle) * outerRadius;
        const y2 =
          CENTER + Math.sin(angle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.shadowBlur = analyser ? 17 : 8;
        ctx.shadowColor = "rgba(255,255,255,0.9)";
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Inner dotted circles
      [125, 105].forEach((radius) => {
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, radius, 0, Math.PI * 2);
        ctx.setLineDash([1, 5]);
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      ctx.setLineDash([]);

      animationFrame = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Start microphone
  async function startMicrophone() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone is unavailable in this browser.");
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

      const source =
        audioContext.createMediaStreamSource(stream);

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

  // Stop microphone
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

  // Tap the waveform to start or stop
  function handleScreenTap() {
    if (listening) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  }

  // Clean up when leaving the page
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

      <section
        style={styles.waveArea}
        onClick={handleScreenTap}
        role="button"
        tabIndex={0}
        aria-label="Tap to start or stop microphone"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleScreenTap();
          }
        }}
      >
        <canvas
          ref={canvasRef}
          style={styles.canvas}
        />
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
    lineHeight: 1,
    color: "white",
    cursor: "pointer"
  },

  waveArea: {
    flex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
    outline: "none"
  },

  canvas: {
    width: "min(90vw, 420px)",
    height: "auto",
    aspectRatio: "1 / 1",
    display: "block",
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
