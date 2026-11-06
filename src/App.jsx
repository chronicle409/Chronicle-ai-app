
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const frequencyRef = useRef(null);
  const lineMotionRef = useRef(new Float32Array(120));

  analyserRef.current = analyser;

  if (
    analyser &&
    (!frequencyRef.current ||
      frequencyRef.current.length !== analyser.frequencyBinCount)
  ) {
    frequencyRef.current = new Uint8Array(analyser.frequencyBinCount);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame;
    let time = 0;
    let width = 0;
    let height = 0;

    const colors = ["#00BFFF", "#008CFF", "#4169E1", "#655CFF"];
    const lineMotion = lineMotionRef.current;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function animate() {
      frame = requestAnimationFrame(animate);
      time += 0.016;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.32;

      const analyser = analyserRef.current;
      const frequency = frequencyRef.current;

      if (listeningRef.current && analyser && frequency) {
        analyser.getByteFrequencyData(frequency);
      }

      // 120 wave lines, each with its own movement pattern
      for (let i = 0; i < 120; i++) {
        const angle = (i / 120) * Math.PI * 2;

        // Different speed, phase and amplitude for every line
        const phase = i * 2.399963;
        const speed = 0.35 + ((i * 7) % 31) * 0.055;
        const amplitude = 5 + ((i * 11) % 9) * 1.1;

        const movement =
          Math.sin(time * speed + phase) * amplitude +
          Math.sin(time * speed * 1.73 + phase * 2.1) * 4.5 +
          Math.cos(time * speed * 0.63 + phase * 0.8) * 3;

        // Each line listens to a different frequency range
        let audioValue = 0;

        if (listeningRef.current && frequency && frequency.length > 0) {
          const position = i / 119;
          const bin = Math.min(
            frequency.length - 1,
            Math.floor(
              Math.pow(position, 1.8) * (frequency.length - 1)
            )
          );

          audioValue = frequency[bin] / 255;
        }

        const target = listeningRef.current ? audioValue * 48 : 0;
        lineMotion[i] += (target - lineMotion[i]) * 0.16;

        const length = Math.max(2, 10 + movement + lineMotion[i]);

        // Small independent sideways movement
        const movingAngle =
          angle +
          Math.sin(time * speed * 0.8 + phase) * 0.025;

        const innerX = cx + Math.cos(movingAngle) * radius;
        const innerY = cy + Math.sin(movingAngle) * radius;

        const outerX =
          cx + Math.cos(movingAngle) * (radius + length);
        const outerY =
          cy + Math.sin(movingAngle) * (radius + length);

        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);

        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Original three rotating rings
      const rings = [
        { angle: time * 0.6, color: "#00BFFF" },
        { angle: -time * 0.45 + Math.PI, color: "#4169E1" },
        { angle: time * 0.3 + Math.PI, color: "#655CFF" }
      ];

      rings.forEach((ring) => {
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          radius - 13,
          ring.angle,
          ring.angle + 1.45
        );
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.stroke();
      });
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
        <canvas ref={canvasRef} className="visualizer-canvas" />
        <div className="logo-circle">
          <img src="/findora-logo.png" alt="FINDORA" />
        </div>
      </div>
    </button>
  );
}
