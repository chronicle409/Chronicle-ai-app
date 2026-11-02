import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = 340;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // limit to 2 for speed
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    
    const cx = size / 2, cy = size / 2;
    let raf;
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, size, size);

      // INNER DOTTED RINGS - light, fast
      ctx.fillStyle = "white";
      for (let i = 0; i < 160; i++) {
        const a = (i / 160) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 72, cy + Math.sin(a) * 72, 0.9, 0, Math.PI * 2);
        ctx.globalAlpha = 0.9;
        ctx.fill();
      }
      for (let i = 0; i < 160; i++) {
        const a = (i / 160) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 86, cy + Math.sin(a) * 86, 0.9, 0, Math.PI * 2);
        ctx.globalAlpha = 0.85;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // OUTER WAVE - thin, smooth, not blobby
      ctx.lineCap = "round";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2.2;
      
      for (let i = 0; i < 160; i++) {
        const a = (i / 160) * Math.PI * 2;
        // SMOOTH wave - slow sines
        const wave = Math.sin(a * 4 + t * 0.02) * 12 
                   + Math.sin(a * 7 + t * 0.015) * 6
                   + Math.sin(a * 2 + t * 0.008) * 4;
        const len = 18 + wave;
        
        const x1 = cx + Math.cos(a) * 96;
        const y1 = cy + Math.sin(a) * 96;
        const x2 = cx + Math.cos(a) * (96 + len);
        const y2 = cy + Math.sin(a) * (96 + len);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="screen">
      <header>
        <div className="search">⌕ Search</div>
        <div className="menu">☰</div>
      </header>

      <div className="wrap">
        <canvas ref={canvasRef} className="canvas" />
      </div>

      <div className="dots"><span className="on"/><span/><span/></div>

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        .screen{
          width:100%;height:100dvh;height:100svh;
          background: #1598ff;
          display:flex;flex-direction:column;
          overflow:hidden;
        }
        header{
          height:56px;padding:0 18px;
          display:flex;justify-content:space-between;align-items:center;
          color:white;font-weight:600;
        }
        .search{font-size:17px}
        .menu{font-size:26px}
        .wrap{
          flex:1;
          display:flex;align-items:center;justify-content:center;
          /* PERFECT CENTER */
        }
        .canvas{
          width:min(84vw, 340px);height:min(84vw, 340px);
          filter: drop-shadow(0 0 14px rgba(255,255,255,0.85)) drop-shadow(0 0 28px rgba(255,255,255,0.4));
        }
        .dots{
          height:44px;display:flex;gap:10px;
          align-items:center;justify-content:center;
        }
        .dots span{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.4)}
        .dots span.on{background:white;box-shadow:0 0 8px white}
      `}</style>
    </div>
  );
}
