
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const dataRef = useRef(null);
  const waveRef = useRef(null);

  analyserRef.current = analyser;

  if (analyser) {
    if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    if (!waveRef.current || waveRef.current.length !== analyser.fftSize) {
      waveRef.current = new Uint8Array(analyser.fftSize);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame;
    let elapsed = 0;
    let previousTime = 0;
    let width = 0;
    let height = 0;
    let smoothVolume = 0;

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

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function drawArc(angle, color, cx, cy, radius) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, angle, angle + 1.45);
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    function drawMovingWave(cx, cy, baseRadius, waveData, track) {
      const points = 240;
      const phase = elapsed * (0.65 + track * 0.23);
      const direction = track % 2 === 0 ? 1 : -1;
      const offsetX = Math.sin(phase * 0.7 + track * 2) * baseRadius * 0.12;
      const offsetY = Math.cos(phase * 0.55 + track * 3) * baseRadius * 0.12;

      ctx.beginPath();

      for (let i = 0; i <= points; i++) {
        const progress = i / points;
        const angle = progress * Math.PI * 2 + phase * direction;

        const sampleIndex = Math.floor(
          progress * (waveData.length - 1)
        );

        const sample = (waveData[sampleIndex] - 128) / 128;

        const nextIndex = Math.min(sampleIndex + 8, waveData.length - 1);
        const detail = (waveData[nextIndex] - 128) / 128;

        const movingShape =
          Math.sin(angle * (2 + track) + phase * 1.8) *
          baseRadius * 0.09;

        const soundMovement =
          sample * baseRadius * 0.48 +
          detail * baseRadius * 0.12;

        const radius =
          baseRadius + movingShape + soundMovement;

        const x =
          cx + offsetX +
          Math.cos(angle) * radius;

        const y =
          cy + offsetY +
          Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();

      ctx.strokeStyle = colors[(track * 2) % colors.length];
      ctx.lineWidth = track === 1 ? 3 : 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 13;
      ctx.shadowColor = colors[(track * 2) % colors.length];
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function animate(time) {
      frame = requestAnimationFrame(animate);

      const delta = previousTime
        ? Math.min((time - previousTime) / 1000, 0.05)
        : 0.016;

      previousTime = time;
      elapsed += delta;

      if (!width || !height) return;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.32;

      const currentAnalyser = analyserRef.current;
      const audioData = dataRef.current;
      const waveData = waveRef.current;

      let hasAudio = false;
      let volume = 0;

      if (currentAnalyser && audioData && waveData) {
        try {
          currentAnalyser.getByteFrequencyData(audioData);
          currentAnalyser.getByteTimeDomainData(waveData);

          let total = 0;

          for (let i = 0; i < waveData.length; i++) {
            const sample = (waveData[i] - 128) / 128;
            total += sample * sample;
          }

          volume = Math.sqrt(total / waveData.length);
          hasAudio = true;
        } catch (error) {
          hasAudio = false;
        }
      }

      const active = listeningRef.current && hasAudio;

      smoothVolume +=
        ((active ? volume : 0) - smoothVolume) * 0.18;

      // Existing circular audio bars
      for (let i = 0; i < 180; i++) {
        const angle = (i / 180) * Math.PI * 2 - Math.PI / 2;

        const wave =
          Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;

        const audio = active
          ? audioData[Math.floor((i / 180) * audioData.length)] / 255
          : 0;

        const movement = active
          ? audio * 35 + wave * 5
          : wave * 7;

        const color =
          colors[Math.floor((i / 180) * colors.length) % colors.length];

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

      // Three moving sound-reactive waveform paths
      if (active && waveData) {
        const strength = Math.min(smoothVolume * 5, 1.5);

        drawMovingWave(
          cx, cy,
          radius + 10 + strength * 10,
          waveData, 0
        );

        drawMovingWave(
          cx, cy,
          radius + 34 + strength * 13,
          waveData, 1
        );

        drawMovingWave(
          cx, cy,
          radius + 57 + strength * 16,
          waveData, 2
        );
      } else {
        // Gentle idle movement
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();

          const idleRadius = radius + 12 + i * 23;

          for (let j = 0; j <= 180; j++) {
            const angle = (j / 180) * Math.PI * 2;

            const movement =
              Math.sin(elapsed * (1.5 + i * 0.3) + j * 0.12) * 4;

            const r = idleRadius + movement;

            const x = cx + Math.cos(angle + elapsed * 0.15) * r;
            const y = cy + Math.sin(angle + elapsed * 0.15) * r;

            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          ctx.strokeStyle = colors[i * 2];
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Keep the original rotating rings
      drawArc(elapsed * 0.65, "#00BFFF", cx, cy, radius - 13);
      drawArc(-elapsed * 0.55 + Math.PI, "#4169E1", cx, cy, radius - 13);
      drawArc(elapsed * 0.35 + Math.PI, "#655CFF", cx, cy, radius - 13);
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
