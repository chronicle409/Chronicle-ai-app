
function Visualizer({ analyser, listening, onToggle }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(analyser);
  const listeningRef = useRef(listening);
  const waveRef = useRef(null);
  const dataRef = useRef(null);

  analyserRef.current = analyser;

  if (analyser) {
    if (!waveRef.current || waveRef.current.length !== analyser.fftSize) {
      waveRef.current = new Uint8Array(analyser.fftSize);
    }
    if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
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
      "#00D5FF", "#00BFFF", "#008CFF", "#007BFF",
      "#315BFF", "#4169E1", "#655CFF", "#1E90FF"
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

    // Flowing waveform that changes position and direction
    function drawFlowWave(cx, cy, radius, waveData, track, strength) {
      const points = 300;
      const phase = elapsed * (0.8 + track * 0.3);
      const direction = track % 2 === 0 ? 1 : -1;

      const driftX = Math.sin(phase * 0.55 + track) * radius * 0.12;
      const driftY = Math.cos(phase * 0.7 + track * 2) * radius * 0.12;

      const angleShift = Math.sin(phase * 0.35 + track) * 0.8;
      const color = colors[(track * 2 + Math.floor(elapsed * 0.5)) % colors.length];

      ctx.beginPath();

      for (let i = 0; i <= points; i++) {
        const progress = i / points;
        const samplePosition = Math.floor(progress * (waveData.length - 1));
        const sample = (waveData[samplePosition] - 128) / 128;

        const nextPosition = Math.min(samplePosition + 5, waveData.length - 1);
        const detail = (waveData[nextPosition] - 128) / 128;

        const angle =
          progress * Math.PI * 2 * direction +
          phase * direction +
          angleShift;

        const travelingWave =
          Math.sin(progress * 12 + phase * 2 + track) *
          radius * 0.055;

        const voiceWave =
          (sample * 0.8 + detail * 0.2) *
          radius * (0.12 + strength * 0.25);

        const sideWave =
          Math.sin(angle * (2 + track) - phase * 1.5) *
          radius * 0.055;

        const r = radius + travelingWave + voiceWave + sideWave;

        const x =
          cx + driftX +
          Math.cos(angle) * r;

        const y =
          cy + driftY +
          Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = track === 1 ? 3 : 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
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
      const waveData = waveRef.current;
      const audioData = dataRef.current;

      let hasAudio = false;
      let volume = 0;

      if (currentAnalyser && waveData && audioData) {
        try {
          currentAnalyser.getByteTimeDomainData(waveData);
          currentAnalyser.getByteFrequencyData(audioData);

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
        ((active ? volume : 0) - smoothVolume) * 0.2;

      const strength = Math.min(smoothVolume * 5, 1.5);

      // Original circular audio bars
      for (let i = 0; i < 180; i++) {
        const angle = (i / 180) * Math.PI * 2 - Math.PI / 2;

        const idleWave =
          Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;

        const audio = active
          ? audioData[Math.floor((i / 180) * audioData.length)] / 255
          : 0;

        const movement = active
          ? audio * 35 + idleWave * 5
          : idleWave * 7;

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

      // Moving voice-reactive waves
      if (active && waveData) {
        drawFlowWave(cx, cy, radius + 12, waveData, 0, strength);
        drawFlowWave(cx, cy, radius + 38, waveData, 1, strength);
        drawFlowWave(cx, cy, radius + 64, waveData, 2, strength);
      } else {
        // Gentle idle animation
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

      // Original rotating rings
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
        <canvas ref={canvasRef} className="visualizer-canvas" />

        <div className="logo-circle">
          <img src="/findora-logo.png" alt="FINDORA" />
        </div>
      </div>
    </button>
  );
}
