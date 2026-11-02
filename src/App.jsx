
import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const [listening, setListening] = useState(false);

  // Lightweight flowing waveform animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const W = 600;
    const H = 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frame;
    let volume = 0;
    const samples = 120;
    const audioSamples = new Uint8Array(1024);

    function drawWave(time, amplitude, phase, opacity, color1, color2) {
      const middle = H / 2;

      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);

      ctx.beginPath();
      ctx.moveTo(0, middle);

      for (let i = 0; i <= samples; i++) {
        const x = (i / samples) * W;
        const progress = i / samples;

        const wave =
          Math.sin(progress * Math.PI * 4 + time * 1.8 + phase) *
          0.65 +
          Math.sin(progress * Math.PI * 2.2 - time * 1.2 + phase) *
          0.35;

        const envelope =
          0.25 + Math.pow(Math.sin(progress * Math.PI), 0.8) * 0.75;

        const y =
          middle +
          wave * amplitude * envelope;

        ctx.lineTo(x, y);
      }

      ctx.lineTo(W, middle);
      ctx.lineTo(0, middle);
      ctx.closePath();

      ctx.globalAlpha = opacity;
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function animate() {
      const time = performance.now() / 1000;

      ctx.clearRect(0, 0, W, H);

      const analyser = analyserRef.current;

      let targetVolume = 0;

      if (analyser) {
        analyser.getByteTimeDomainData(audioSamples);

        let sum = 0;

        for (let i = 0; i < audioSamples.length; i++) {
          const value = (audioSamples[i] - 128) / 128;
          sum += value * value;
        }

        targetVolume = Math.sqrt(sum / audioSamples.length);
      }

      volume += (targetVolume - volume) * 0.18;

      const amplitude = 65 + volume * 400;

      // Dark translucent moving wave behind
      drawWave(
        time,
        amplitude * 0.75,
        1.5,
        0.38,
        "#ff7777",
        "#a90025"
      );

      // Main glowing red wave
      drawWave(
        time,
        amplitude,
        0,
        0.96,
        "#ff1645",
        "#e00027"
      );

      frame = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(frame);
  }, []);

  async function toggleMicrophone() {
    if (listening) {
      stopMicrophone();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      const audio = new AudioContextClass();
      audioRef.current = audio;

      await audio.resume();

      const source = audio.createMediaStreamSource(stream);
      const analyser = audio.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);
      analyserRef.current = analyser;

      setListening(true);
    } catch (error) {
      console.error(error);
      alert("Microphone error: " + error.message);
      stopMicrophone();
    }
  }

  function stopMicrophone() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.close();
      audioRef.current = null;
    }

    analyserRef.current = null;
    setListening(false);
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioRef.current) {
        audioRef.current.close();
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
        style={styles.animationArea}
        onClick={toggleMicrophone}
        role="button"
        tabIndex={0}
        aria-label="Tap to start or stop listening"
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleMicrophone();
          }
        }}
      >
        <canvas
          ref={canvasRef}
          style={styles.canvas}
        />

        <img
          src="/findora-logo.png"
          alt="FINDORA logo"
          style={styles.logo}
          draggable="false"
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
    color: "white"
  },

  animationArea: {
    flex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    cursor: "pointer",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent"
  },

  canvas: {
    width: "100%",
    maxWidth: "600px",
    height: "auto",
    aspectRatio: "2 / 1",
    display: "block",
    pointerEvents: "none"
  },

  logo: {
    position: "absolute",
    width: "23%",
    maxWidth: "125px",
    height: "auto",
    objectFit: "contain",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
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
    boxShadow: "0 0 12px white"
  }
};
