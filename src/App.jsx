
useEffect(() => {
  if (!isListening || !canvasRef.current || !streamRef.current) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  let audioContext;
  let source;
  let analyser;
  let frame;
  let stopped = false;
  let lastDraw = 0;

  const count = 110;
  const smooth = new Array(count).fill(0);
  const size = 360;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cx = size / 2;
  const cy = size / 2;

  const startAudio = async () => {
    try {
      audioContext = new AudioContextClass();
      await audioContext.resume();

      if (stopped) {
        await audioContext.close();
        return;
      }

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.88;

      source = audioContext.createMediaStreamSource(streamRef.current);
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      const draw = (now) => {
        if (stopped) return;

        frame = requestAnimationFrame(draw);

        // Limit drawing to approximately 30 frames per second
        if (now - lastDraw < 33) return;
        lastDraw = now;

        analyser.getByteFrequencyData(data);
        ctx.clearRect(0, 0, size, size);

        const time = now * 0.001;

        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const index = Math.floor((i / count) * data.length * 0.85);
          const level = data[index] / 255;

          smooth[i] += (level - smooth[i]) * 0.16;

          const organic = Math.sin(i * 0.1 + time * 1.5) * 2;
          const inner = 151;
          const outer = inner + 5 + smooth[i] * 27 + organic;

          const x1 = cx + Math.cos(angle) * inner;
          const y1 = cy + Math.sin(angle) * inner;
          const x2 = cx + Math.cos(angle) * outer;
          const y2 = cy + Math.sin(angle) * outer;

          const hue = 190 + (i / count) * 105;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsl(${hue}, 100%, 78%)`;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        // Outer circular ring
        ctx.beginPath();
        ctx.arc(cx, cy, 174, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(190,225,255,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      frame = requestAnimationFrame(draw);
    } catch {
      setError("The audio visualizer could not start.");
    }
  };

  startAudio();

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);

    try {
      source?.disconnect();

      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    } catch {}
  };
}, [isListening]);
