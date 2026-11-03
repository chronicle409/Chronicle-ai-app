
import React, { useEffect, useRef } from "react";

export function RadialVisualizer({ analyser, listening }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame;
    let lastFrame = 0;
    let phase = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const BAR_COUNT = 120;
    const data = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = (time) => {
      frame = requestAnimationFrame(draw);

      // Limit drawing to approximately 30 FPS.
      if (time - lastFrame < 33) return;
      lastFrame = time;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.29;

      if (analyser && data && listening) {
        analyser.getByteFrequencyData(data);
      }

      phase += 0.018;

      for (let i = 0; i < BAR_COUNT; i++) {
        const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;

        const frequencyIndex = Math.floor(
          (i / BAR_COUNT) * (data?.length || 1)
        );

        const audioValue =
          analyser && data && listening
            ? data[frequencyIndex] / 255
            : 0;

        const gentleMotion =
          listening
            ? 0.04 + Math.sin(phase + i * 0.16) * 0.025
            : 0.015;

        const barLength =
          5 + audioValue * 48 + gentleMotion * 30;

        const innerRadius = baseRadius + 12;
        const outerRadius = innerRadius + barLength;

        const x1 = cx + Math.cos(angle) * innerRadius;
        const y1 = cy + Math.sin(angle) * innerRadius;
        const x2 = cx + Math.cos(angle) * outerRadius;
        const y2 = cy + Math.sin(angle) * outerRadius;

        const hue = 190 + (i / BAR_COUNT) * 130;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = `hsl(${hue}, 100%, 65%)`;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";

        ctx.shadowBlur = 9;
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;

        ctx.stroke();
      }

      ctx.shadowBlur = 0;
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [analyser, listening]);

  return (
    <div className="findora-visualizer">
      <canvas ref={canvasRef} className="findora-wave" />

      <div className="findora-logo-circle">
        <img src="/findora-logo.png" alt="FINDORA" />
      </div>
    </div>
  );
}
