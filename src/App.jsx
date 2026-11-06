
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationId;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let elapsed = 0;
    let previousTime = 0;
    let resizeObserver;
    let barGroups = [];

    const COUNT = 180;

    const audioData = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

    const bars = Array.from({ length: COUNT }, (_, i) => {
      const angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;

      return {
        x: Math.cos(angle),
        y: Math.sin(angle),
        phase: angle
      };
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();

      const newWidth = rect.width;
      const newHeight = rect.height;
      const newDpr = Math.min(window.devicePixelRatio || 1, 1.25);

      if (
        width === newWidth &&
        height === newHeight &&
        dpr === newDpr
      ) return;

      width = newWidth;
      height = newHeight;
      dpr = newDpr;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      barGroups = [];

      for (let group = 0; group < 6; group++) {
        const hue = 345 + group * 7;

        barGroups.push({
          start: Math.floor(group * COUNT / 6),
          end: Math.floor((group + 1) * COUNT / 6),
          color: `hsl(${hue}, 100%, 62%)`
        });
      }
    }

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const radius = () => Math.min(width, height) * 0.32;

    // Smooth ring drawing: one clean stroke per ring.
    function drawRing(cx, cy, r, rotation, color) {
      ctx.save();

      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        r,
        rotation,
        rotation + 1.45
      );

      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";

      ctx.shadowBlur = 8;
      ctx.shadowColor = color;

      ctx.stroke();

      ctx.restore();
    }

    function draw(timestamp) {
      animationId = requestAnimationFrame(draw);

      if (document.hidden) {
        previousTime = 0;
        return;
      }

      const delta = previousTime
        ? Math.min((timestamp - previousTime) / 1000, 0.04)
        : 0;

      previousTime = timestamp;
      elapsed += delta;

      const cx = width / 2;
      const cy = height / 2;
      const r = radius();

      if (!width || !height) return;

      if (analyser && audioData && listening) {
        analyser.getByteFrequencyData(audioData);
      }

      ctx.clearRect(0, 0, width, height);

      // 180 radial bars with waves moving in different directions.
      for (const group of barGroups) {
        ctx.beginPath();

        for (let i = group.start; i < group.end; i++) {
          const bar = bars[i];

          const wave1 = Math.sin(bar.phase * 3 - elapsed * 2.0);
          const wave2 = Math.sin(bar.phase * 5 + elapsed * 1.6);
          const wave3 = Math.sin(bar.phase * 2 - elapsed * 1.2);

          const wave = (wave1 + wave2 + wave3) / 3;

          let audioMovement = 0;

          if (listening && audioData) {
            const index = Math.floor(
              (i / COUNT) * audioData.length
            );

            audioMovement = (audioData[index] / 255) * 28;
          }

          const movement = 8 + wave * 6 + audioMovement;
          const outer = r + movement;

          ctx.moveTo(
            cx + bar.x * r,
            cy + bar.y * r
          );

          ctx.lineTo(
            cx + bar.x * outer,
            cy + bar.y * outer
          );
        }

        ctx.globalAlpha = 1;
        ctx.strokeStyle = group.color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Three independently rotating rings.
      drawRing(
        cx, cy, r - 13,
        elapsed * 0.55,
        "#ff1744"
      );

      drawRing(
        cx, cy, r - 13,
        -elapsed * 0.45 + Math.PI,
        "#ff4d6d"
      );

      drawRing(
        cx, cy, r - 13,
        elapsed * 0.30 + Math.PI,
        "#d50000"
      );

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver?.disconnect();
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
