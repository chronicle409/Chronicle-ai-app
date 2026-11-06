
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const dataRef = useRef(null);
  const waveRef = useRef(null);

  analyserRef.current = analyser;

  if (analyser) {
    if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    if (!waveRef.current || waveRef.current.length !== analyser.fftSize) {
      waveRef.current = new Uint8Array(analyser.fftSize);
    }
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
    let smoothVolume = 0;

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
      const waveData = waveRef.current;

      let hasAudio = false;
      let volume = 0;

      if (currentAnalyser && audioData && waveData) {
        try {
          currentAnalyser.getByteFrequencyData(audioData);
          currentAnalyser.getByteTimeDomainData(waveData);

          let total = 0;

          for (let i = 0; i < waveData.length; i++) {
            const sample = (waveData[i] - 128) / 128;
            total += sample * sample;
          }

          volume = Math.sqrt(total / waveData.length);
          hasAudio = true;
        } catch (error) {
          hasAudio = false;
        }
      }

      const active = listeningRef.current && hasAudio;

      smoothVolume +=
        ((active ? volume : 0) - smoothVolume) * 0.18;

      // Circular audio bars
      for (let i = 0; i < 180; i++) {
        const angle = (i / 180) * Math.PI * 2 - Math.PI / 2;

        const wave =
          Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;

        const audio = active
          ? audioData[Math.floor((i / 180) * audioData.length)] / 255
          : 0;

        const movement = active
          ? audio * 35 + wave * 5
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

      // Live recording waveform line
      if (active && waveData) {
        const samples = 180;

        ctx.beginPath();

        for (let i = 0; i <= samples; i++) {
          const angle = (i / samples) * Math.PI * 2 - Math.PI / 2;

          const index = Math.floor(
            (i / samples) * (waveData.length - 1)
          );

          const sample = (waveData[index] - 128) / 128;

          const movement = sample * 48;
          const radiusWave = radius + 19 + movement;

          const x = cx + Math.cos(angle) * radiusWave;
          const y = cy + Math.sin(angle) * radiusWave;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const gradient = ctx.createLinearGradient(
          cx - radius,
          cy - radius,
          cx + radius,
          cy + radius
        );

        gradient.addColorStop(0, "#00D5FF");
        gradient.addColorStop(0.35, "#007BFF");
        gradient.addColorStop(0.7, "#655CFF");
        gradient.addColorStop(1, "#00BFFF");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#008CFF";
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Gentle movement while not recording
        ctx.beginPath();

        for (let i = 0; i <= 180; i++) {
          const angle = (i / 180) * Math.PI * 2 - Math.PI / 2;

          const movement =
            Math.sin(elapsed * 2 + i * 0.12) * 3;

          const r = radius + 19 + movement;

          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = "#008CFF";
        ctx.lineWidth = 2;
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
