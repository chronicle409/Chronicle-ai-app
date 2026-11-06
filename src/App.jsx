
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const dataRef = useRef(null);

  analyserRef.current = analyser;
  listeningRef.current = listening;

  if (analyser && (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount)) {
    dataRef.current = new Uint8Array(analyser.frequencyBinCount);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true
    });

    if (!ctx) return;

    let frameId;
    let elapsed = 0;
    let lastTime = 0;
    let width = 0;
    let height = 0;

    const COUNT = 180;

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

      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function drawArc(rotation, color, cx, cy, radius) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, rotation, rotation + 1.45);
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    function draw(timestamp) {
      frameId = requestAnimationFrame(draw);

      const delta = lastTime
        ? Math.min((timestamp - lastTime) / 1000, 0.05)
        : 0.016;

      lastTime = timestamp;
      elapsed += delta;

      if (!width || !height) return;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.32;

      const currentAnalyser = analyserRef.current;
      const audioData = dataRef.current;

      if (listeningRef.current && currentAnalyser && audioData) {
        try {
          currentAnalyser.getByteFrequencyData(audioData);
        } catch (error) {
          // Keep the visual animation running if audio data is unavailable.
        }
      }

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;

        const audio = listeningRef.current && audioData
          ? audioData[Math.floor((i / COUNT) * audioData.length)] / 255
          : 0;

        const wave = Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;

        const movement = listeningRef.current
          ? audio * 35 + wave * 8
          : wave * 7;

        const color = colors[Math.floor((i / COUNT) * colors.length) % colors.length];

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

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

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
