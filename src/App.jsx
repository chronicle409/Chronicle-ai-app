
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
    let smoothVolume = 0;

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

      smoothVolume += (volume - smoothVolume) * 0.14;

      // Every line has its own movement
      for (let i = 0; i < 120; i++) {
        const baseAngle = (i / 120) * Math.PI * 2;

        const phase = i * 2.399963;
        const speed = 0.5 + (i % 19) * 0.075;

        // Different movement patterns for every line
        const movement =
          Math.sin(time * speed + phase) * 3.5 +
          Math.sin(time * speed * 0.73 + phase * 1.8) * 2.0 +
          Math.cos(time * speed * 0.41 + phase * 0.6) * 1.2;

        // Individual microphone response
        let audioValue = 0;

        if (listeningRef.current && wave && wave.length > 0) {
          const sampleIndex = Math.floor(
            ((i * 37) % 120) / 120 * wave.length
          );

          audioValue = Math.abs((wave[sampleIndex] - 128) / 128);
        }

        // Shared voice response keeps the whole circle active
        const sharedVoice = smoothVolume * 110;

        const individualVoice = audioValue * 22;

        const target = listeningRef.current
          ? sharedVoice + individualVoice
          : 0;

        lineMotion[i] += (target - lineMotion[i]) * 0.16;

        const length = Math.max(
          2,
          7 + movement + lineMotion[i]
        );

        // Each line has a slightly different angle
        const angle =
          baseAngle +
          Math.sin(time * speed * 0.6 + phase) * 0.014;

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
