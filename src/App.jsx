import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function RadialVisualizer({ analyser, listening }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let frame;
    let elapsed = 0;
    let lastFrame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const COUNT = 180;
    const data = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = (timestamp) => {
      frame = requestAnimationFrame(draw);
      if (timestamp - lastFrame < 33) return;
      lastFrame = timestamp;
      elapsed += 0.033;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.315;

      if (analyser && data && listening) {
        analyser.getByteFrequencyData(data);
      }

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;
        const audio = listening && data
          ? data[Math.floor((i / COUNT) * data.length)] / 255
          : 0;

        const wave = Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;
        const movement = listening
          ? audio * 17 + wave * 4
          : wave * 3;

        const inner = radius;
        const outer = radius + 4 + movement;

        const hue = 185 + (i / COUNT) * 100;
        const color = `hsl(${hue}, 100%, 66%)`;

        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(angle) * inner,
          cy + Math.sin(angle) * inner
        );
        ctx.lineTo(
          cx + Math.cos(angle) * outer,
          cy + Math.sin(angle) * outer
        );

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 7;
        ctx.shadowColor = color;
        ctx.stroke();
      }

      const drawArc = (rotation, color) => {
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          radius - 10,
          rotation,
          rotation + 0.95
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
      };

      drawArc(elapsed * 0.75, "#a43dff");
      drawArc(-elapsed * 0.65 + Math.PI, "#20dfff");
      ctx.shadowBlur = 0;
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [analyser, listening]);

  return (
    <div className="findora-visualizer">
      <canvas ref={canvasRef} className="findora-wave" />
      <div className="findora-logo-circle">
        <img src="/findora-logo.png" alt="FINDORA" />
      </div>
    </div>
  );
}

export default function App() {
  const [listening, setListening] = useState(false);
  const [analyser, setAnalyser] = useState(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);

  const toggleListening = async () => {
    if (listening) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioRef.current?.close();
      streamRef.current = null;
      audioRef.current = null;
      setAnalyser(null);
      setListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const audio = new AudioContext();
      const source = audio.createMediaStreamSource(stream);
      const analyserNode = audio.createAnalyser();

      analyserNode.fftSize = 512;
      source.connect(analyserNode);

      streamRef.current = stream;
      audioRef.current = audio;
      setAnalyser(analyserNode);
      setListening(true);
    } catch {
      alert("Microphone access was not granted. Please check your permissions.");
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioRef.current?.close();
    };
  }, []);

  return (
    <main className="findora-app">
      <header className="findora-header">
        <h1>FINDORA<span>.</span></h1>
        <p>MUSIC RECOGNITION</p>
      </header>

      <section className="findora-main">
        <p className="findora-status">
          {listening ? "LISTENING TO AUDIO" : "READY TO DISCOVER"}
        </p>

        <RadialVisualizer
          analyser={analyser}
          listening={listening}
        />

        <h2>{listening ? "Listening..." : "Discover any song"}</h2>
        <p className="findora-description">
          {listening
            ? "Let FINDORA hear the music around you."
            : "Tap the button and let the music play."}
        </p>

        <button
          className={listening ? "findora-button active" : "findora-button"}
          onClick={toggleListening}
        >
          {listening ? "STOP LISTENING" : "START LISTENING"}
        </button>
      </section>

      <footer>FINDORA AI · DISCOVER YOUR SOUND</footer>
    </main>
  );
}
