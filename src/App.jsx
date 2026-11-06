import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  useEffect(() => {
    if (!voiceOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const count = 120;
    const bars = Array.from({ length: count }, () => ({
      value: 3,
      gain: 0.65 + Math.random() * 1.2,
    }));
    let raf;
    let bins = null;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.29;
      ctx.clearRect(0, 0, w, h);

      const analyser = analyserRef.current;
      if (analyser) {
        if (!bins || bins.length !== analyser.frequencyBinCount) {
          bins = new Uint8Array(analyser.frequencyBinCount);
        }
        if (listeningRef.current) {
          analyser.getByteFrequencyData(bins);
        } else {
          bins.fill(0);
        }
      }

      let peak = 0;
      let average = 0;
      if (bins && listeningRef.current) {
        for (let i = 0; i < bins.length; i++) {
          average += bins[i];
          if (bins[i] > peak) peak = bins[i];
        }
        average /= bins.length;
      }

      const speaking = listeningRef.current && peak > 24 && average > 3;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const index = bins
          ? Math.min(
              bins.length - 1,
              Math.floor(Math.pow(i / count, 1.7) * bins.length)
            )
          : 0;

        const energy = speaking && bins ? bins[index] / 255 : 0;
        const target = speaking ? 3 + energy * 54 * bars[i].gain : 3;
        bars[i].value += (target - bars[i].value) * 0.2;

        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + bars[i].value);
        const y2 = cy + Math.sin(angle) * (radius + bars[i].value);
        const hue = 190 + (i / count) * 85;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsla(${hue}, 100%, 62%, ${0.65 + energy * 0.35})`;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      const t = performance.now() * 0.00025;
      [
        { r: radius - 12, a: t * 0.6, c: "#00BFFF" },
        { r: radius - 21, a: -t * 0.45, c: "#4169E1" },
        { r: radius - 30, a: t * 0.3, c: "#655CFF" },
      ].forEach((ring) => {
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, ring.a, ring.a + 1.5);
        ctx.strokeStyle = ring.c;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.stroke();
      });

      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [voiceOpen]);

  async function startVoice() {
    setNotice("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is not available in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audio = new AudioContextClass();
      audioRef.current = audio;

      const source = audio.createMediaStreamSource(stream);
      const analyser = audio.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyserRef.current = analyser;
      setListening(true);
    } catch (error) {
      setNotice("Please allow microphone access in your browser to use Voice.");
      setListening(false);
    }
  }

  function stopVoice() {
    setListening(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;

    if (audioRef.current) {
      audioRef.current.close().catch(() => {});
    }
    audioRef.current = null;
    analyserRef.current = null;
  }

  async function toggleVoice() {
    if (voiceOpen) {
      stopVoice();
      setVoiceOpen(false);
    } else {
      setVoiceOpen(true);
      await startVoice();
    }
  }

  function chooseTool(tool) {
    setPrompt(tool);
    setNotice(`${tool} selected. Type your request in the box below.`);
  }

  return (
    <main className="findora">
      <style>{`
        *{box-sizing:border-box}
        html,body,#root{margin:0;min-height:100%;background:#000}
        body{font-family:Arial,Helvetica,sans-serif}
        .findora{min-height:100svh;background:#000;color:#f7f7f7;position:relative;overflow:hidden;padding:0 7.5% 14px;display:flex;flex-direction:column}
        .topbar{height:82px;flex:none;display:flex;align-items:center;justify-content:space-between}
        .iconbtn{border:0;background:transparent;color:white;padding:5px;display:grid;place-items:center;cursor:pointer}
        .iconbtn svg{width:30px;height:30px;stroke:currentColor;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
        .profile svg{width:36px;height:36px}
        .center-stage{flex:1;min-height:210px;display:flex;align-items:center;justify-content:center}
        .pulse-logo{width:116px;height:116px;flex:none;border-radius:50%;background:#fff;display:grid;place-items:center}
        .pulse-logo svg{width:83px;height:60px}
        .voice-stage{flex:1;min-height:210px;display:flex;align-items:center;justify-content:center}
        .voice-canvas{width:min(76vw,300px);height:min(76vw,300px);max-height:300px;max-width:300px}
        .tool-list{display:flex;flex-direction:column;gap:18px;margin:0 0 24px 4px;flex:none}
        .tool{display:flex;align-items:center;gap:18px;color:#f3f3f3;background:none;border:0;text-align:left;font-size:17px;cursor:pointer;padding:0}
        .tool svg{width:30px;height:30px;stroke:white;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
        .composer{height:62px;flex:none;border-radius:40px;background:#171717;display:flex;align-items:center;gap:9px;padding:6px 9px 6px 15px;margin:0 -1%}
        .plus{font-size:32px;font-weight:200;line-height:1;background:none;border:0;color:white;cursor:pointer;padding:0 4px}
        .prompt{background:transparent;border:0;outline:0;color:white;min-width:0;flex:1;font-size:14px}
        .prompt::placeholder{color:#d0d0d0}
        .smallbtn{background:transparent;border:0;color:white;padding:3px;cursor:pointer;display:grid;place-items:center}
        .smallbtn svg{width:25px;height:25px;stroke:white;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .mic svg{width:24px;height:27px}
        .voice-btn{border:0;border-radius:40px;background:#0878f9;color:white;display:flex;align-items:center;gap:6px;padding:8px 11px;font-size:15px;white-space:nowrap;cursor:pointer}
        .voice-btn svg{width:25px;height:25px;stroke:white;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
        .voice-btn.active{background:#075dcc}
        .notice{font-size:12px;color:#aaa;text-align:center;margin:8px 0 0;flex:none}
        .popover{position:absolute;top:70px;background:#1b1b1b;border:1px solid #333;border-radius:14px;padding:14px 18px;z-index:3;display:flex;flex-direction:column;gap:14px}
        .popover.left{left:7%}.popover.right{right:7%}
        .popover button{color:white;background:none;border:0;text-align:left;font-size:16px;padding:4px}
        @media(max-height:650px){.topbar{height:64px}.tool-list{gap:12px;margin-bottom:14px}.center-stage,.voice-stage{min-height:160px}.composer{height:56px}}
      `}</style>

      <header className="topbar">
        <button className="iconbtn" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
          <svg viewBox="0 0 48 48"><path d="M5 9h38M5 24h38M5 39h38" /></svg>
        </button>
        <button className="iconbtn profile" aria-label="Profile" onClick={() => setProfileOpen(!profileOpen)}>
          <svg viewBox="0 0 56 56"><path d="M8 27c4-4 36-4 40 0l-3 7H11zM13 26l4-15c1-3 5-2 8-1 4 2 7 2 11 0 3-1 6-1 7 2l4 14M18 36a7 7 0 1 0 14 0 7 7 0 0 0-14 0ZM34 36a7 7 0 1 0 14 0 7 7 0 0 0-14 0ZM32 36h2" /></svg>
        </button>
      </header>

      {menuOpen && <div className="popover left"><button onClick={() => setMenuOpen(false)}>New chat</button><button onClick={() => setMenuOpen(false)}>History</button><button onClick={() => setMenuOpen(false)}>Settings</button></div>}
      {profileOpen && <div className="popover right"><button onClick={() => setProfileOpen(false)}>Profile</button><button onClick={() => setProfileOpen(false)}>Settings</button></div>}

      {voiceOpen ? (
        <section className="voice-stage">
          <canvas ref={canvasRef} className="voice-canvas" width="500" height="500" />
        </section>
      ) : (
        <section className="center-stage">
          <div className="pulse-logo" aria-label="Chronicle voice logo">
            <svg viewBox="0 0 180 130"><path d="M8 66 C25 67 35 83 49 68 L61 54 L72 94 Q77 106 82 88 L91 36 Q95 17 100 45 L110 112 Q114 126 119 101 L131 28 Q136 5 141 40 L148 70 Q152 84 171 57" fill="none" stroke="#0878f9" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </section>
      )}

      {!voiceOpen && (
        <section className="tool-list">
          <button className="tool" onClick={() => chooseTool("Create an image")}><svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="5" /><circle cx="32" cy="15" r="4" /><path d="M5 36l12-13 8 8 5-5 13 13" /></svg>Create an image</button>
          <button className="tool" onClick={() => chooseTool("Translate language")}><svg viewBox="0 0 48 48"><path d="M5 7h25v23H18l-8 7v-7H5zM19 18h23v22h-7l-7 5v-5h-9" /><path d="M12 14h11M17 11v3M14 23l5-7 5 7M31 26h7M34 23v3" /></svg>Translate language</button>
          <button className="tool" onClick={() => chooseTool("Search the web")}><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" /><path d="M4 24h40M24 4c-12 11-12 29 0 40M24 4c12 11 12 29 0 40" /></svg>Search the web</button>
        </section>
      )}

      <div className="composer">
        <button className="plus" aria-label="More options" onClick={() => setMenuOpen(!menuOpen)}>+</button>
        <input className="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask Chronicle" />
        <button className="smallbtn" aria-label="Emoji" onClick={() => setPrompt((p) => p + " 🙂")}><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" /><path d="M14 24s2 5 6 5 6-5 6-5M14 15h.1M26 15h.1" /></svg></button>
        <button className="smallbtn mic" aria-label="Microphone" onClick={toggleVoice}><svg viewBox="0 0 40 44"><rect x="13" y="3" width="14" height="25" rx="7" /><path d="M7 21a13 13 0 0 0 26 0M20 34v7M14 41h12" /></svg></button>
        <button className={`voice-btn ${voiceOpen ? "active" : ""}`} onClick={toggleVoice}>
          <svg viewBox="0 0 40 40"><path d="M2 21h5l4-10 5 20 5-25 5 28 5-17 4 4h3" /></svg>
          {voiceOpen ? "Close" : "Voice"}
        </button>
      </div>
      {notice && <p className="notice">{notice}</p>}
    </main>
  );
}
