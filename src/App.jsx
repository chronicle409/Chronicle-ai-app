
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const frequencyRef = useRef(null);
  const motionRef = useRef(
    Array.from({ length: 120 }, (_, i) => ({
      phase: i * 2.399963,
      speed: 0.45 + ((i * 13) % 37) * 0.047,
      amplitude: 7 + ((i * 17) % 13) * 1.1,
      audio: 0
    }))
  );

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
    const motions = motionRef.current;

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

      // Every line has its own independent movement
      for (let i = 0; i < 120; i++) {
        const motion = motions[i];
        const angle = (i / 120) * Math.PI * 2;

        const wave1 = Math.sin(
          time * motion.speed + motion.phase
        ) * motion.amplitude;

        const wave2 = Math.cos(
          time * motion.speed * 1.91 + motion.phase * 1.37
        ) * 6;

        const wave3 = Math.sin(
          time * motion.speed * 0.53 + motion.phase * 2.73
        ) * 4;

        let audioValue = 0;

        if (listeningRef.current && frequency && frequency.length) {
          const bin = Math.min(
            frequency.length - 1,
            Math.floor((i / 120) * frequency.length)
          );

          audioValue = frequency[bin] / 255;
        }

        const target = listeningRef.current ? audioValue * 45 : 0;
        motion.audio += (target - motion.audio) * 0.18;

        const length = Math.max(
          2,
          12 + wave1 + wave2 + wave3 + motion.audio
        );

        const movingAngle =
          angle +
          Math.sin(time * motion.speed * 0.71 + motion.phase) * 0.035;

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

      // Three original rotating rings
      const rings = [
        { angle: time * 0.6, color: "#00BFFF" },
        { angle: -time * 0.45 + Math.PI, color: "#4169E1" },
        { angle: time * 0.3 + Math.PI, color: "#655CFF" }
      ];

      rings.forEach((ring) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 13, ring.angle, ring.angle + 1.45);
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
