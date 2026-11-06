
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const waveRef = useRef(null);
  const lineMotionRef = useRef(new Float32Array(120));

  analyserRef.current = analyser;

  if (analyser && (!waveRef.current || waveRef.current.length !== analyser.fftSize)) {
    waveRef.current = new Uint8Array(analyser.fftSize);
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
      const wave = waveRef.current;

      if (listeningRef.current && analyser && wave) {
        analyser.getByteTimeDomainData(wave);
      }

      // 120 independently moving audio lines
      for (let i = 0; i < 120; i++) {
        const baseAngle = (i / 120) * Math.PI * 2;

        // Give every line its own rhythm and movement
        const phase = i * 2.399963;
        const speed = 0.65 + (i % 17) * 0.047;

        const idle =
          Math.sin(time * speed + phase) * 2.2 +
          Math.sin(time * speed * 0.63 + phase * 1.7) * 1.4;

        // Each line reads a different microphone sample
        let audioValue = 0;

        if (listeningRef.current && wave && wave.length > 0) {
          const sampleIndex = Math.floor((i / 120) * wave.length);
          audioValue = Math.abs((wave[sampleIndex] - 128) / 128);
        }

        // Smooth individual microphone reactions
        const target = audioValue * 38;
        lineMotion[i] += (target - lineMotion[i]) * 0.18;

        const length = 5 + idle + lineMotion[i];

        // Tiny individual angle movement
        const angle =
          baseAngle +
          Math.sin(time * speed * 0.55 + phase) * 0.012;

        const innerX = cx + Math.cos(angle) * radius;
        const innerY = cy + Math.sin(angle) * radius;

        const outerX = cx + Math.cos(angle) * (radius + length);
        const outerY = cy + Math.sin(angle) * (radius + length);

        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);

        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Three smooth rotating rings
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
