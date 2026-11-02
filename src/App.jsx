import { useRef, useState, useEffect } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = 320;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const center = size / 2;

    function draw() {
      ctx.clearRect(0, 0, size, size);
      const data = new Uint8Array(128);
      if (analyserRef.current) analyserRef.current.getByteFrequencyData(data);

      // YOUR WHITE WAVE - OUTER DOTS
      for (let i = 0; i < 180; i++) {
        const a = (i / 180) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(center + Math.cos(a) * 105, center + Math.sin(a) * 105, 1.7, 0, Math.PI * 2);
        ctx.fillStyle = "#FFF";
        ctx.shadowBlur = 7;
        ctx.shadowColor = "#FFF";
        ctx.fill();
      }
      // INNER DOTS
      for (let i = 0; i < 150; i++) {
        const a = (i / 150) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(center + Math.cos(a) * 91, center + Math.sin(a) * 91, 1, 0, Math.PI * 2);
        ctx.fillStyle = "#FFF";
        ctx.shadowBlur = 0;
        ctx.fill();
      }
      // BARS
      for (let i = 0; i < 180; i++) {
        const a = (i / 180) * Math.PI * 2;
        const f = analyserRef.current ? data[Math.floor(i/180*128)]/255 : 0.15 + Math.sin(Date.now()/250 + i*0.3)*0.1;
        const len = 5 + f * 48;
        ctx.beginPath();
        ctx.moveTo(center + Math.cos(a)*112, center + Math.sin(a)*112);
        ctx.lineTo(center + Math.cos(a)*(112+len), center + Math.sin(a)*(112+len));
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#FFF";
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  async function toggle() {
    if (recording) {
      streamRef.current?.getTracks().forEach(t=>t.stop());
      analyserRef.current = null;
      setRecording(false);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    streamRef.current = stream;
    const ac = new AudioContext();
    await ac.resume();
    const an = ac.createAnalyser();
    an.fftSize = 256;
    ac.createMediaStreamSource(stream).connect(an);
    analyserRef.current = an;
    setRecording(true);
  }

  return (
    <div style={{minHeight:"100vh",background:"#000",display:"flex",flexDirection:"column",alignItems:"center",paddingTop:60}}>
      {/* THIS IS YOUR LENS BOX - NOW WITH WHITE WAVE IN MIDDLE */}
      <div style={{width:"340px",height:"340px",background:"#0f0f0f",borderRadius:28,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
        <canvas ref={canvasRef} style={{width:"320px",height:"320px"}} />
        <div style={{position:"absolute",bottom:18,color:"#666",fontSize:14}}>Tap lens</div>
      </div>

      <div style={{display:"flex",gap:50,marginTop:35,alignItems:"center"}}>
        <button style={{width:56,height:56,borderRadius:16,background:"#1a1a1a",border:"none",color:"#fff"}}>⊞</button>
        <button onClick={toggle} className="camBtn" style={{width:76,height:76,borderRadius:"50%",border:"3px solid #fff",background:"#2f88ff",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:recording?26:0,height:recording?26:0,background:recording?"#fff":"transparent",borderRadius:4}} />
        </button>
        <button style={{width:56,height:56,borderRadius:16,background:"#1a1a1a",border:"none",color:"#fff"}}>♪</button>
      </div>

      <button onClick={toggle} style={{marginTop:20,padding:"14px 30px",borderRadius:30,border:"none",background:"#fff",color:"#2f88ff",fontWeight:700}}>
        {recording?"Stop recording":"Start recording"}
      </button>

      <style>{`
        .camBtn{transform-box:fill-box;transform-origin:center}
        .camBtn:active{animation:shutterClick 0.6s ease-in-out}
        @keyframes shutterClick{0%{transform:scale(1)}30%{transform:scale(0.85)}60%{transform:scale(1.08)}100%{transform:scale(1)}}
      `}</style>
    </div>
  )
      }
