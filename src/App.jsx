
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const frequencyRef = useRef(null);
  const motionRef = useRef(null);

  analyserRef.current = analyser;

  if (!motionRef.current) {
    motionRef.current = Array.from({ length: 120 }, () => ({
      length: 8 + Math.random() * 20,
      target: 8 + Math.random() * 20,
      nextChange: Math.random() * 0.5,
      speed: 0.06 + Math.random() * 0.15,
      anglePhase: Math.random() * Math.PI * 2,
      angleSpeed: 0.5 + Math.random() * 2,
      micGain: 0.5 + Math.random() * 1.2
    }));
  }

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

      let audioValue = 0;

      if (listeningRef.current && analyser && frequency) {
        analyser.getByteFrequencyData(frequency);

        let total = 0;

        for (let j = 0; j < frequency.length; j++) {
          total += frequency[j];
        }

        audioValue = total / (frequency.length * 255);
      }

      // Every line gets its own independent movement
      for (let i = 0; i < 120; i++) {
        const motion = motions[i];
        const angle = (i / 120) * Math.PI * 2;

        // Change each line at its own time
        if (time >= motion.nextChange) {
          motion.target = 4 + Math.random() * 27;
          motion.nextChange =
            time + 0.12 + Math.random() * 0.65;
        }

        // Microphone response is different for every line
        const audioBoost = listeningRef.current
          ? audioValue * 65 * motion.micGain
          : 0;

        const desiredLength = motion.target + audioBoost;

        // Each line has its own smoothing speed
        motion.length +=
          (desiredLength - motion.length) * motion.speed;

        // Independent sideways movement
        const movingAngle =
          angle +
          Math.sin(
            time * motion.angleSpeed + motion.anglePhase
          ) * 0.025;

        const length = Math.max(2, motion.length);

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
