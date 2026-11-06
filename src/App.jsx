
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const audioStateRef = useRef({ analyser: null, data: null });

  analyserRef.current = analyser;
  listeningRef.current = listening;

  if (audioStateRef.current.analyser !== analyser) {
    audioStateRef.current = {
      analyser,
      data: analyser
        ? new Uint8Array(analyser.frequencyBinCount)
        : null
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true
    });

    if (!ctx) return;

    let animation;
    let elapsed = 0;
    let lastTime = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

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

      const newWidth = rect.width;
      const newHeight = rect.height;
      const newDpr = Math.min(
        window.devicePixelRatio || 1,
        1.25
      );

      const pixelWidth = Math.round(newWidth * newDpr);
      const pixelHeight = Math.round(newHeight * newDpr);

      if (
        canvas.width === pixelWidth &&
        canvas.height === pixelHeight
      ) return;

      width = newWidth;
      height = newHeight;
      dpr = newDpr;

      canvas.width = pixelWidth;
      canvas.height = pixelHeight;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function drawArc(rotation, color, cx, cy, radius) {
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        radius,
        rotation,
        rotation + 1.45
      );

      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    function draw(timestamp) {
      animation = requestAnimationFrame(draw);

      const delta = lastTime
        ? Math.min((timestamp - lastTime) / 1000, 0.05)
        : 0.016;

      lastTime = timestamp;
      elapsed += delta;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.32;

      const currentAnalyser = analyserRef.current;
      const audioState = audioStateRef.current;

      if (
        listeningRef.current &&
        currentAnalyser &&
        audioState.data
      ) {
        currentAnalyser.getByteFrequencyData(
          audioState.data
        );
      }

      // 180 CONTINUOUS BLUE RADIAL BARS

      for (let i = 0; i < COUNT; i++) {
        const angle =
          (i / COUNT) * Math.PI * 2 - Math.PI / 2;

        const audio =
          listeningRef.current &&
          audioState.data
            ? audioState.data[
                Math.floor(
                  (i / COUNT) * audioState.data.length
                )
              ] / 255
            : 0;

        const wave =
          Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;

        const movement = listeningRef.current
          ? audio * 35 + wave * 8
          : wave * 7;

        const color = colors[
          Math.floor(
            (i / COUNT) * colors.length
          ) % colors.length
        ];

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

      // THREE INDEPENDENTLY ROTATING BLUE RINGS

      drawArc(
        elapsed * 0.65,
        "#00BFFF",
        cx,
        cy,
        radius - 13
      );

      drawArc(
        -elapsed * 0.55 + Math.PI,
        "#4169E1",
        cx,
        cy,
        radius - 13
      );

      drawArc(
        elapsed * 0.35 + Math.PI,
        "#655CFF",
        cx,
        cy,
        radius - 13
      );
    }

    animation = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animation);
      observer.disconnect();
    };
  }, []);

  return (
    <button
      type="button"
      className={`visualizer-button ${
        listening ? "is-listening" : ""
      }`}
      onClick={onToggle}
      aria-label={listening ? "Stop listening" : "Start listening"}
    >
      <div className="visualizer-container">
        <canvas
          ref={canvasRef}
          className="visualizer-canvas"
        />

        <div className="logo-circle">
          <img
            src="/findora-logo.png"
            alt="FINDORA"
          />
        </div>
      </div>
    </button>
  );
}
