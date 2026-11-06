
import { useState, useRef, useEffect } from "react";
import "./App.css";

function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const dataRef = useRef(null);

  analyserRef.current = analyser;

  if (
    analyser &&
    (!dataRef.current ||
      dataRef.current.length !== analyser.frequencyBinCount)
  ) {
    dataRef.current = new Uint8Array(analyser.frequencyBinCount);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame;
    let elapsed = 0;
    let previousTime = 0;
    let width = 0;
    let height = 0;

    const colors = [
      "#00D5FF",
      "#00BFFF",
      "#008CFF",
      "#007BFF",
      "#315BFF",
      "#4169E1",
      "#655CFF",
      "#1E90FF"
    ];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function drawArc(angle, color, cx, cy, radius) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, angle, angle + 1.45);
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    function animate(time) {
      frame = requestAnimationFrame(animate);

      const delta = previousTime
        ? Math.min((time - previousTime) / 1000, 0.05)
        : 0.016;

      previousTime = time;
      elapsed += delta;

      if (!width || !height) return;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.32;

      const currentAnalyser = analyserRef.current;
      const audioData = dataRef.current;

      let hasAudio = false;

      if (currentAnalyser && audioData) {
        try {
          currentAnalyser.getByteFrequencyData(audioData);
          hasAudio = true;
        } catch (error) {
          hasAudio = false;
        }
      }

      for (let i = 0; i < 180; i++) {
        const angle =
          (i / 180) * Math.PI * 2 - Math.PI / 2;

        const wave =
          Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;

        const audio = listeningRef.current && hasAudio
          ? audioData[
              Math.floor((i / 180) * audioData.length)
            ] / 255
          : 0;

        const movement = listeningRef.current
          ? audio * 35 + wave * 8
          : wave * 7;

        const color =
          colors[Math.floor((i / 180) * colors.length) % colors.length];

        ctx.beginPath();

        ctx.moveTo(
          cx + Math.cos(angle) * radius,
          cy + Math.sin(angle) * radius
        );

        ctx.lineTo(
          cx + Math.cos(angle) * (radius + 8 + movement),
          cy + Math.sin(angle) * (radius + 8 + movement)
        );

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      drawArc(elapsed * 0.65, "#00BFFF", cx, cy, radius - 13);
      drawArc(-elapsed * 0.55 + Math.PI, "#4169E1", cx, cy, radius - 13);
      drawArc(elapsed * 0.35 + Math.PI, "#655CFF", cx, cy, radius - 13);
    }

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  return (
    <button
      type="button"
      className={`visualizer-button ${listening ? "is-listening" : ""}`}
      onClick={onToggle}
      aria-label={listening ? "Stop listening" : "Start listening"}
    >
      <div className="visualizer-container">
        <canvas
          ref={canvasRef}
          className="visualizer-canvas"
        />

        <div className="logo-circle">
          <img src="/findora-logo.png" alt="FINDORA" />
        </div>
      </div>
    </button>
  );
}

export default function App() {
  const [listening, setListening] = useState(false);
  const [analyser, setAnalyser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const busyRef = useRef(false);

  async function startListening() {
    if (busyRef.current) return;

    busyRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("Audio is not supported by this browser.");
      }

      const audioContext = new AudioContextClass();

      await audioContext.resume();

      const audioAnalyser = audioContext.createAnalyser();
      audioAnalyser.fftSize = 512;
      audioAnalyser.smoothingTimeConstant = 0.82;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(audioAnalyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceRef.current = source;

      setAnalyser(audioAnalyser);
      setListening(true);
    } catch (error) {
      console.error("FINDORA microphone error:", error);

      alert(
        "FINDORA could not start the microphone. Please check your browser microphone permission and try again."
      );
    } finally {
      busyRef.current = false;
    }
  }

  async function stopListening() {
    if (busyRef.current) return;

    busyRef.current = true;

    try {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setAnalyser(null);
      setListening(false);
    } catch (error) {
      console.error("FINDORA stop error:", error);
      setListening(false);
    } finally {
      busyRef.current = false;
    }
  }

  async function toggleListening() {
    if (listening) {
      await stopListening();
    } else {
      await startListening();
    }
  }

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="findora-app">
      <header className="topbar">
        <button
          className="top-icon"
          type="button"
          onClick={() => {
            setMenuOpen(!menuOpen);
            setSearchOpen(false);
          }}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          className="top-icon"
          type="button"
          onClick={() => {
            setSearchOpen(!searchOpen);
            setMenuOpen(false);
          }}
          aria-label="Search"
        >
          <svg viewBox="0 0 24 24">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 5 5" />
          </svg>
        </button>
      </header>

      {menuOpen && (
        <div className="menu-panel">
          <button
            className="menu-mic"
            type="button"
            onClick={toggleListening}
            aria-label="Toggle microphone"
          >
            <svg viewBox="0 0 24 24">
              <rect x="9" y="2" width="6" height="13" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v4M9 22h6" />
            </svg>
          </button>
        </div>
      )}

      {searchOpen && (
        <div className="search-panel">
          <input
            type="search"
            placeholder="Search..."
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
          />
        </div>
      )}

      <main className="main-display">
        <Visualizer
          analyser={analyser}
          listening={listening}
          onToggle={toggleListening}
        />
      </main>
    </div>
  );
}
