
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const waveRef = useRef(null);

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

      let volume = 0;

      if (listeningRef.current && analyser && wave) {
        analyser.getByteTimeDomainData(wave);

        let total = 0;
        for (let i = 0; i < wave.length; i++) {
          const value = (wave[i] - 128) / 128;
          total += value * value;
        }

        volume = Math.sqrt(total / wave.length);
      }

      // Clean animated audio bars
      for (let i = 0; i < 120; i++) {
        const angle = (i / 120) * Math.PI * 2;
        const audioValue = wave && listeningRef.current
          ? Math.abs((wave[Math.floor(i / 120 * wave.length)] - 128) / 128)
          : 0;

        const idle = Math.sin(time * 2 + i * 0.15) * 3;
        const length = 5 + idle + audioValue * 38 + volume * 20;

        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(angle) * radius,
          cy + Math.sin(angle) * radius
        );
        ctx.lineTo(
          cx + Math.cos(angle) * (radius + length),
          cy + Math.sin(angle) * (radius + length)
        );

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
