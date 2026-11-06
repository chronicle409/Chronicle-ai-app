
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);

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
    let lastFrame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let gradient = null;

    const COUNT = 180;
    const FRAME_INTERVAL = 1000 / 30;

    const audioData = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

    function resize() {
      const rect = canvas.getBoundingClientRect();

      const newDpr = Math.min(
        window.devicePixelRatio || 1,
        1
      );

      const newWidth = rect.width;
      const newHeight = rect.height;

      if (
        newWidth === width &&
        newHeight === height &&
        newDpr === dpr
      ) {
        return;
      }

      width = newWidth;
      height = newHeight;
      dpr = newDpr;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = width / 2;
      const cy = height / 2;

      gradient = ctx.createConicGradient(
        -Math.PI / 2,
        cx,
        cy
      );

      gradient.addColorStop(0, "#ff1744");
      gradient.addColorStop(0.25, "#ff4d6d");
      gradient.addColorStop(0.5, "#ff1744");
      gradient.addColorStop(0.75, "#ff8a3d");
      gradient.addColorStop(1, "#ff1744");
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function drawArc(cx, cy, radius, rotation, color) {
      const start = rotation;
      const end = rotation + 1.45;

      // Soft outer glow without expensive shadowBlur.
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, end);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 13;
      ctx.lineCap = "round";
      ctx.stroke();

      // Main bright ring.
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, end);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    function draw(timestamp) {
      animation = requestAnimationFrame(draw);

      if (document.hidden) return;

      if (timestamp - lastFrame < FRAME_INTERVAL) return;

      const delta = lastFrame
        ? Math.min((timestamp - lastFrame) / 1000, 0.05)
        : 0.033;

      lastFrame = timestamp;
      elapsed += delta;

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.32;

      if (analyser && audioData && listening) {
        analyser.getByteFrequencyData(audioData);
      }

      ctx.clearRect(0, 0, width, height);

      // 180 bars with waves travelling from different directions.
      ctx.beginPath();

      for (let i = 0; i < COUNT; i++) {
        const angle =
          (i / COUNT) * Math.PI * 2 - Math.PI / 2;

        const audio = listening && audioData
          ? audioData[
              Math.floor((i / COUNT) * audioData.length)
            ] / 255
          : 0;

        const waveOne =
          Math.sin(angle * 3 - elapsed * 2.2);

        const waveTwo =
          Math.sin(angle * 5 + elapsed * 1.7);

        const waveThree =
          Math.sin(angle * 2 + elapsed * 1.2);

        const combinedWave =
          (waveOne + waveTwo + waveThree) / 3;

        const movement = listening
          ? audio * 28 + 8 + combinedWave * 6
          : 8 + combinedWave * 6;

        const outerRadius = radius + movement;

        ctx.moveTo(
          cx + Math.cos(angle) * radius,
          cy + Math.sin(angle) * radius
        );

        ctx.lineTo(
          cx + Math.cos(angle) * outerRadius,
          cy + Math.sin(angle) * outerRadius
        );
      }

      ctx.globalAlpha = 1;
      ctx.strokeStyle = gradient || "#ff1744";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      // Three rings rotating in different directions.
      drawArc(
        cx,
        cy,
        radius - 13,
        elapsed * 0.65,
        "#ff1744"
      );

      drawArc(
        cx,
        cy,
        radius - 13,
        -elapsed * 0.55 + Math.PI,
        "#ff4d6d"
      );

      drawArc(
        cx,
        cy,
        radius - 13,
        elapsed * 0.35 + Math.PI,
        "#d50000"
      );

      ctx.globalAlpha = 1;
    }

    animation = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animation);
      observer.disconnect();
    };
  }, [analyser, listening]);

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
          <img
            src="/findora-logo.png"
            alt="FINDORA"
          />
        </div>
      </div>
    </button>
  );
}
