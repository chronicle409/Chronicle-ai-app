
import React, { useEffect, useRef } from "react";

export function RadialVisualizer({ analyser, listening }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrame;
    let lastFrame = 0;
    let elapsed = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const COUNT = 180;
    const data = analyser
      ? new Uint8Array(analyser.frequencyBinCount)
      : null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const colors = [
      { position: 0, hue: 185 },
      { position: 0.25, hue: 220 },
      { position: 0.5, hue: 275 },
      { position: 0.75, hue: 150 },
      { position: 1, hue: 185 }
    ];

    const getHue = (position) => {
      const p = position * (colors.length - 1);
      const index = Math.min(Math.floor(p), colors.length - 2);
      const mix = p - index;

      return colors[index].hue +
        (colors[index + 1].hue - colors[index].hue) * mix;
    };

    const drawArc = (cx, cy, radius, start, length, color) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, start + length);

      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.stroke();
    };

    const draw = (timestamp) => {
      animationFrame = requestAnimationFrame(draw);

      if (timestamp - lastFrame < 33) return;
      lastFrame = timestamp;

      elapsed += 0.033;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const size = Math.min(width, height);
      const radius = size * 0.315;

      if (analyser && data && listening) {
        analyser.getByteFrequencyData(data);
      }

      // Circular radial lights.
      for (let i = 0; i < COUNT; i++) {
        const position = i / COUNT;
        const angle = position * Math.PI * 2 - Math.PI / 2;

        const frequencyIndex = Math.floor(
          position * (data?.length || 1)
        );

        const audio = listening && data
          ? data[frequencyIndex] / 255
          : 0;

        const wave =
          Math.sin(elapsed * 2.5 + i * 0.19) * 0.5 + 0.5;

        const secondaryWave =
          Math.sin(elapsed * 1.6 - i * 0.11) * 0.5 + 0.5;

        const movement = listening
          ? audio * 17 + wave * 4 + secondaryWave * 2
          : wave * 3;

        const inner = radius;
        const outer = radius + 4 + movement;

        const x1 = cx + Math.cos(angle) * inner;
        const y1 = cy + Math.sin(angle) * inner;
        const x2 = cx + Math.cos(angle) * outer;
        const y2 = cy + Math.sin(angle) * outer;

        const hue = getHue(position);
        const color = `hsl(${hue}, 100%, 66%)`;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.shadowBlur = 7;
        ctx.shadowColor = color;
        ctx.stroke();
      }

      // Two continuously rotating neon arcs.
      const arcRadius = radius - 10;
      const rotation1 = elapsed * 0.75;
      const rotation2 = -elapsed * 0.65 + Math.PI;

      drawArc(
        cx,
        cy,
        arcRadius,
        rotation1,
        0.95,
        "#a43dff"
      );

      drawArc(
        cx,
        cy,
        arcRadius,
        rotation2,
        0.95,
        "#20dfff"
      );

      ctx.shadowBlur = 0;
    };

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [analyser, listening]);

  return (
    <div className="findora-visualizer">
      <canvas
        ref={canvasRef}
        className="findora-wave"
      />

      <div className="findora-logo-circle">
        <img
          src="/findora-logo.png"
          alt="FINDORA"
        />
      </div>
    </div>
  );
}
