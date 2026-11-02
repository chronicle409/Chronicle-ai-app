import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = 420;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = size / 2, cy = size / 2;
    let frame, t = 0;

    function draw() {
      ctx.clearRect(0, 0, size, size);

      // INNER DOTTED CIRCLE - 1
      for (let i = 0; i < 180; i++) {
        const a = (i / 180) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 98, cy + Math.sin(a) * 98, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.globalAlpha = 0.85;
        ctx.fill();
      }
      // INNER DOTTED CIRCLE - 2
      for (let i = 0; i < 180; i++) {
        const a = (i / 180) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 114, cy + Math.sin(a) * 114, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.globalAlpha = 0.85;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // OUTER WAVY BARS - exactly like your picture
      for (let i = 0; i < 200; i++) {
        const a = (i / 200) * Math.PI * 2;
        // This creates the wavy organic shape from your image
        const wave = Math.sin(a * 6 + t * 0.03) * 10 + Math.sin(a * 10 + t * 0.02) * 6 + Math.sin(a * 3 + t * 0.01) * 4;
        const len = 28 + wave;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 124, cy + Math.sin(a) * 124);
        ctx.lineTo(cx + Math.cos(a) * (124 + len), cy + Math.sin(a) * (124 + len));
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        ctx.shadowBlur = 18;
        ctx.shadowColor = "white";
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      t++;
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="screen">
      <header className="top">
        <div className="search">⌕ Search</div>
        <button className="menu">☰</button>
      </header>

      <div className="center">
        <canvas ref={canvasRef} />
      </div>

      <div className="dots">
        <span className="on"></span>
        <span></span>
        <span></span>
      </div>

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        .screen{
          width:100%;height:100dvh;
          background: #0090ff;
          background: linear-gradient(180deg, #33b0ff 0%, #0a90ff 45%, #0088ff 100%);
          position:relative;overflow:hidden;
          font-family: system-ui, Arial;
        }
        .top{
          position:absolute;top:0;left:0;right:0;
          padding:18px 20px;
          display:flex;justify-content:space-between;align-items:center;
          color:white;z-index:10;
        }
        .search{font-size:18px;font-weight:600;display:flex;gap:8px;align-items:center}
        .menu{background:none;border:none;color:white;font-size:28px;opacity:0.95}
        .center{
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:min(92vw, 440px);
          aspect-ratio:1;
          display:grid;place-items:center;
        }
        .center canvas{
          width:100%;height:100%;
          filter: drop-shadow(0 0 22px rgba(255,255,255,0.9));
        }
        .dots{
          position:absolute;bottom:22px;left:50%;transform:translateX(-50%);
          display:flex;gap:10px;align-items:center;
        }
        .dots span{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,0.35)}
        .dots span.on{background:white;box-shadow:0 0 8px white}
      `}</style>
    </div>
  );
}
