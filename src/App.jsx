
const draw = () => {
  if (stopped) return;

  animationFrame = requestAnimationFrame(draw);

  analyser.getByteFrequencyData(frequencies);

  ctx.clearRect(0, 0, 380, 380);

  const cx = 190;
  const cy = 190;
  const count = 180;
  const time = performance.now() * 0.001;

  const colors = [
    "#00E5FF",
    "#168BFF",
    "#684CFF",
    "#A83CFF",
    "#F044E8"
  ];

  // Neon glow around the circle
  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#8A4DFF";

  // Circular spectrum bars
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;

    const index = Math.floor(
      (i / count) * frequencies.length * 0.8
    );

    const level = frequencies[index] / 255;

    smoothed[i] += (level - smoothed[i]) * 0.18;

    const inner = 139;
    const length = 5 + smoothed[i] * 43;

    const x1 = cx + Math.cos(angle) * inner;
    const y1 = cy + Math.sin(angle) * inner;

    const x2 = cx + Math.cos(angle) * (inner + length);
    const y2 = cy + Math.sin(angle) * (inner + length);

    const colorIndex = Math.floor(
      ((i / count) * colors.length + time * 0.12) %
      colors.length
    );

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.strokeStyle = colors[colorIndex];
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  ctx.restore();

  // Two glowing rotating arc sections
  ctx.save();
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.shadowBlur = 16;

  const arcs = [
    { color: "#00E5FF", start: time * 0.5, length: 0.65 },
    { color: "#A83CFF", start: Math.PI + time * 0.5, length: 0.65 }
  ];

  arcs.forEach(arc => {
    ctx.beginPath();
    ctx.strokeStyle = arc.color;
    ctx.shadowColor = arc.color;
    ctx.arc(
      cx,
      cy,
      139,
      arc.start,
      arc.start + arc.length
    );
    ctx.stroke();
  });

  ctx.restore();

  // Soft outer neon glow
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 151, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(100, 130, 255, 0.22)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#00C8FF";
  ctx.stroke();
  ctx.restore();
};
