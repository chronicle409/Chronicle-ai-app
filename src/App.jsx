import { useState } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e";

export default function Findora() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const startListening = async () => {
    try {
      setStatus('listening');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], "listen.webm");
        stream.getTracks().forEach(t => t.stop());
        const form = new FormData();
        form.append('file', file);
        form.append('api_token', AUDD_TOKEN);
        form.append('return', 'apple_music,spotify');
        const res = await fetch('https://api.audd.io/', { method: 'POST', body: form });
        const data = await res.json();
        if(data.result) setResult(data.result);
        else setResult({ title: "No match", artist: "Try again near speaker" });
        setStatus('found');
      };
      recorder.start();
      setTimeout(()=> recorder.state==='recording' && recorder.stop(), 8000);
    } catch(e){ alert("Allow Mic"); setStatus('idle'); }
  };

  return (
    <div style={{
      minHeight:'100vh', 
      background: 'radial-gradient(circle at 70% 20%, #7DD8FF 0%, #00A6FF 25%, #0091EA 50%, #0081FF 100%)',
      display:'flex', flexDirection:'column', position:'relative', fontFamily:'system-ui'
    }}>
      {/* TOP BAR - EXACT LIKE IMAGE */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, color:'white'}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round"/></svg>
          <span style={{fontSize:16, fontWeight:600}}>Search</span>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:5}}>
          <div style={{width:26, height:3, background:'white', borderRadius:2}}></div>
          <div style={{width:26, height:3, background:'white', borderRadius:2}}></div>
          <div style={{width:26, height:3, background:'white', borderRadius:2}}></div>
        </div>
      </div>

      {/* CENTER LOGO - EXACT LIKE YOUR IMAGE */}
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <div 
          onClick={status==='idle' ? startListening : undefined}
          style={{cursor:'pointer', position:'relative', width:200, height:200, display:'flex', alignItems:'center', justifyContent:'center'}}
        >
          {/* Pulse when listening */}
          {status==='listening' && <>
            <div style={{position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(0,255,255,0.25)', animation:'pulse 1.5s infinite'}}></div>
            <div style={{position:'absolute', width:260, height:260, borderRadius:'50%', background:'rgba(0,255,255,0.15)', animation:'pulse 1.5s infinite 0.5s'}}></div>
          </>}

          {/* YOUR LOGO - SVG EXACT COPY */}
          <svg width="180" height="180" viewBox="0 0 100 100" style={{filter:'drop-shadow(0 0 25px rgba(0,255,255,0.6))', zIndex:2}}>
            {/* Magnifying glass shape */}
            <path d="M 55 8 A 30 30 0 1 1 42 12" fill="none" stroke="#00F5FF" strokeWidth="7" strokeLinecap="round" />
            <path d="M 35 18 A 28 28 0 1 0 75 68" fill="none" stroke="#00F5FF" strokeWidth="7" strokeLinecap="round" />
            <path d="M 72 66 L 85 84" fill="none" stroke="#00F5FF" strokeWidth="9" strokeLinecap="round" />
            <circle cx="50" cy="8" r="6" fill="#00F5FF"/>
            <line x1="50" y1="8" x2="50" y2="18" stroke="#00F5FF" strokeWidth="4"/>
            {/* Eyes */}
            <ellipse cx="38" cy="45" rx="7" ry="10" fill="white"/>
            <ellipse cx="62" cy="45" rx="7" ry="10" fill="white"/>
            {status==='listening' && <>
              <ellipse cx="38" cy="47" rx="4" ry="5" fill="#0091EA" opacity="0.8"><animate attributeName="cy" values="45;48;45" dur="0.3s" repeatCount="indefinite"/></ellipse>
              <ellipse cx="62" cy="47" rx="4" ry="5" fill="#0091EA" opacity="0.8"><animate attributeName="cy" values="45;48;45" dur="0.3s" repeatCount="indefinite"/></ellipse>
            </>}
          </svg>
        </div>

        <div style={{marginTop:40, textAlign:'center', color:'white'}}>
          {status==='idle' && <><p style={{fontSize:17, fontWeight:600}}>Tap to Find Song</p><p style={{fontSize:12, opacity:0.8, marginTop:6}}>Find the name of any song</p></>}
          {status==='listening' && <p style={{fontSize:18, fontWeight:700, animation:'blink 1s infinite'}}>Listening...</p>}
          {status==='found' && (
            <div style={{background:'white', color:'#333', borderRadius:20, padding:'16px 20px', minWidth:280, marginTop:10}}>
              <p style={{fontWeight:800, fontSize:14}}>{result.title}</p>
              <p style={{fontSize:12, color:'#666', marginTop:4}}>{result.artist}</p>
              <button onClick={()=>setStatus('idle')} style={{marginTop:14, width:'100%', background:'#00A6FF', color:'white', border:'none', padding:10, borderRadius:10, fontWeight:700}}>Find Again</button>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM DOTS - EXACT LIKE IMAGE */}
      <div style={{display:'flex', justifyContent:'center', gap:8, paddingBottom:28}}>
        <div style={{width:8, height:8, background: status==='idle' ? 'white' : 'rgba(255,255,255,0.5)', borderRadius:'50%'}}></div>
        <div style={{width:8, height:8, background: status==='listening' ? 'white' : 'rgba(255,255,255,0.5)', borderRadius:'50%'}}></div>
        <div style={{width:8, height:8, background: status==='found' ? 'white' : 'rgba(255,255,255,0.5)', borderRadius:'50%'}}></div>
      </div>

      <style>{`
        @keyframes pulse{0%{transform:scale(0.9);opacity:1}100%{transform:scale(1.4);opacity:0}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>
    </div>
  );
}
