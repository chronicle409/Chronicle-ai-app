import { useRef, useState, useEffect } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const animRef = useRef(null);
  const dotRef = useRef(null);
  const flashRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 320;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const center = size / 2;

    function animate() {
      ctx.clearRect(0, 0, size, size);
      const radius = 105;
      const data = new Uint8Array(128);
      if (analyserRef.current) analyserRef.current.getByteFrequencyData(data);

      // Wave audio - white dotted rings (middle)
      for (let i = 0; i < 180; i++) {
        const a = (i / 180) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(center + Math.cos(a) * radius, center + Math.sin(a) * radius, 1.7, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 7;
        ctx.shadowColor = "#FFFFFF";
        ctx.fill();
      }
      for (let i = 0; i < 150; i++) {
        const a = (i / 150) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(center + Math.cos(a) * 91, center + Math.sin(a) * 91, 1, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 0;
        ctx.fill();
      }
      for (let i = 0; i < 180; i++) {
        const a = (i / 180) * Math.PI * 2;
        const f = analyserRef.current ? data[Math.floor((i/180)*128)]/255 : 0.12 + Math.sin(Date.now()/250 + i*0.3)*0.08;
        const len = 5 + f * 48;
        ctx.beginPath();
        ctx.moveTo(center + Math.cos(a)*112, center + Math.sin(a)*112);
        ctx.lineTo(center + Math.cos(a)*(112+len), center + Math.sin(a)*(112+len));
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#FFFFFF";
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  async function handleClick() {
    if (dotRef.current) {
      dotRef.current.classList.remove("shutterClick");
      void dotRef.current.offsetWidth;
      dotRef.current.classList.add("shutterClick");
    }
    if (flashRef.current) {
      flashRef.current.classList.remove("show");
      void flashRef.current.offsetWidth;
      flashRef.current.classList.add("show");
    }

    setTimeout(async () => {
      setStarted(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        await ac.resume();
        const analyser = ac.createAnalyser();
        analyser.fftSize = 256;
        ac.createMediaStreamSource(stream).connect(analyser);
        analyserRef.current = analyser;

        const rec = new MediaRecorder(stream);
        recorderRef.current = rec;
        chunksRef.current = [];
        rec.ondataavailable = e => { if(e.data.size) chunksRef.current.push(e.data); };
        rec.start();
        setRecording(true);
      } catch { alert("Allow microphone"); }
    }, 300);
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorderRef.current.mimeType });
        console.log(URL.createObjectURL(blob));
      };
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    analyserRef.current = null;
    setRecording(false);
    setStarted(false);
  }

  return (
    <div className="wrap">
      {/* LENS STAGE - WAVE AUDIO IN MIDDLE */}
      <div className="lensStage" onClick={!started ? handleClick : undefined}>
        
        {/* Your lens camera features */}
        <svg className="cameraDeco" viewBox="0 0 300 270">
          <path className="camera-body" d="M48 50 H97 L108 19 Q112 8 125 8 H180 Q193 8 197 20 L208 50 H253 Q280 50 280 78 V222 Q280 250 253 250 H48 Q20 250 20 222 V78 Q20 50 48 50 Z" />
          <circle className="lensRing" cx="150" cy="145" r="64" />
          <circle ref={flashRef} className="flash" cx="249" cy="89" r="85" />
          <circle ref={dotRef} className="camera-button" cx="249" cy="89" r="12" fill="#2f88ff" />
        </svg>

        <div className={`waveBox ${started ? 'show' : ''}`}>
          <canvas ref={canvasRef} />
        </div>

        {!started && <div className="hint">Tap lens</div>}
      </div>

      <div className="controls">
        <button className="icon">◫</button>
        <button onClick={started ? stop : handleClick} className={`shutter ${recording ? 'rec' : ''}`}>
          {recording ? <div className="stop" /> : <div className="inner" />}
        </button>
        <button className="icon">♪</button>
      </div>

      <button className="label" onClick={started ? stop : handleClick}>
        {recording ? "Stop recording" : "Start recording"}
      </button>

      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        .wrap{min-height:100vh;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui}
        
        .lensStage{position:relative;width:min(92vw,360px);aspect-ratio:0.95;background:#000;border-radius:36px;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;border:1px solid #1a1a1a}
        .cameraDeco{position:absolute;width:88%;height:88%;opacity:0.15;pointer-events:none}
        .camera-body,.lensRing{fill:none;stroke:#2f88ff;stroke-width:18;stroke-linecap:round}
        .flash{fill:#2f88ff;opacity:0;transform-origin:249px 89px}
        .flash.show{animation:flashA 0.6s ease-out forwards}
        @keyframes flashA{0%{opacity:0;transform:scale(0.1)}40%{opacity:0.3;transform:scale(0.8)}100%{opacity:0;transform:scale(1.8)}}

        .camera-button{transform-box:fill-box;transform-origin:center;cursor:pointer;pointer-events:auto}
        .camera-button.shutterClick{animation:shutterClick 0.6s ease-in-out}
        @keyframes shutterClick{0%{transform:scale(1)}30%{transform:scale(0.88)}60%{transform:scale(1.08)}100%{transform:scale(1)}}

        .waveBox{width:100%;height:100%;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0.9);transition:0.5s}
        .waveBox.show{opacity:1;transform:scale(1)}
        .waveBox canvas{width:94%;height:94%}
        .hint{position:absolute;bottom:24px;color:#fff;opacity:0.5;font-size:13px}

        .controls{width:min(92vw,280px);display:flex;justify-content:space-between;align-items:center;margin-top:28px}
        .icon{width:48px;height:48px;border-radius:14px;border:none;background:#111;color:#fff;font-size:18px}
        .shutter{width:74px;height:74px;border-radius:50%;border:4px solid #2f88ff;background:#fff;display:flex;align-items:center;justify-content:center}
        .shutter.rec{border-color:#ff3b30}
        .inner{width:58px;height:58px;background:#2f88ff;border-radius:50%}
        .stop{width:28px;height:28px;background:#ff3b30;border-radius:4px}
        .label{margin-top:20px;padding:13px 30px;border:none;border-radius:30px;background:#fff;color:#2f88ff;font-weight:700;font-size:15px}
      `}</style>
    </div>
  )
}
