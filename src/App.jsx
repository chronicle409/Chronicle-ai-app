import { useState, useRef } from 'react';

const AUDD_TOKEN = "c961a8e99fb8b8fd0e59ea9d83d4e2e";

export default function Findora() {
  const [status, setStatus] = useState('idle'); // idle, listening, found
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const mediaRecorderRef = useRef(null);

  const startListening = async () => {
    try {
      setStatus('listening');
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], "listen.webm");
        stream.getTracks().forEach(t => t.stop());
        await identify(file);
      };
      
      recorder.start();
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), 8000);
    } catch (err) {
      alert("Allow microphone! " + err.message);
      setStatus('idle');
    }
  };

  const identify = async (file) => {
    const form = new FormData();
    form.append('file', file);
    form.append('api_token', AUDD_TOKEN);
    form.append('return', 'apple_music,spotify');
    
    try {
      const res = await fetch('https://api.audd.io/', { method: 'POST', body: form });
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
        setHistory(h => [data.result, ...h].slice(0,5));
        setStatus('found');
      } else {
        setResult({ title: "No match", artist: "Try louder / closer to speaker" });
        setStatus('found');
      }
    } catch(e) {
      setResult({ title: "Error", artist: e.message });
      setStatus('found');
    }
  };

  return (
    <div style={{minHeight:'100vh', background: status==='found' ? '#FF9A2E' : '#FFCC00', display:'flex', flexDirection:'column', fontFamily:'system-ui', transition:'0.3s'}}>
      {/* Top Bar like your picture */}
      <div style={{display:'flex', justifyContent:'space-between', padding:'20px 16px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:4}}><div style={{width:26,height:4,background:'white',borderRadius:4}}></div><div style={{width:26,height:4,background:'white',borderRadius:4}}></div><div style={{width:26,height:4,background:'white',borderRadius:4}}></div></div>
        <div style={{fontSize:22}}>🔍</div>
      </div>

      {/* CENTER - Exactly like your video */}
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{width:300, background:'white', borderRadius:24, padding:'12px', boxShadow:'0 20px 40px rgba(0,0,0,0.15)'}}>
          <div style={{background: status==='found' ? 'white' : '#FF9A2E', borderRadius:18, minHeight:440, padding:'16px', position:'relative', overflow:'hidden'}}>
            
            {status !== 'found' ? (
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:400}}>
                <p style={{color:'white', fontWeight:600, marginBottom:30, fontSize:14}}>‹ Song finder</p>
                
                {/* MIC WITH PULSE ANIMATION - like your video */}
                <div style={{position:'relative', width:120, height:120, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {status==='listening' && <>
                    <div style={{position:'absolute', width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.3)', animation:'pulse 1.5s infinite'}}></div>
                    <div style={{position:'absolute', width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.15)', animation:'pulse 1.5s infinite 0.5s'}}></div>
                  </>}
                  <button onClick={status==='idle' ? startListening : ()=>{}} style={{width:80,height:80,background:'white',borderRadius:'50%',border:'none',fontSize:36,zIndex:2, cursor:'pointer'}}>🎤</button>
                </div>

                <p style={{color:'white', marginTop:30, fontSize:13, fontWeight:500}}>
                  {status==='idle' ? 'Find Song' : 'We are listening...'}
                </p>
                {status==='idle' && <p style={{color:'rgba(255,255,255,0.8)', fontSize:10, marginTop:6}}>Find the name of any song</p>}
              </div>
            ) : (
              <div>
                <p style={{fontWeight:700, fontSize:14, marginBottom:12}}>‹ Song finder <span style={{fontWeight:400, opacity:0.6, marginLeft:8}}>Recent search</span></p>
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {[result, ...history].filter(Boolean).slice(0,5).map((s,i)=>(
                    <div key={i} style={{background:'white', borderRadius:12, padding:'10px', display:'flex', gap:10, alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                      <div style={{width:40,height:40,background:'#FFE9B3', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center'}}>🎵</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12, fontWeight:600}}>{s.title}</div>
                        <div style={{fontSize:10, color:'#888'}}>{s.artist}</div>
                      </div>
                      <button style={{background:'#00C851', color:'white', border:'none', borderRadius:20, padding:'4px 10px', fontSize:10}}>Open</button>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setStatus('idle')} style={{marginTop:16, width:'100%', background:'#FFCC00', border:'none', padding:'12px', borderRadius:12, fontWeight:600}}>Tap to Listen Again</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%{transform:scale(0.8); opacity:1}100%{transform:scale(1.4); opacity:0}}`}</style>
      
      <div style={{display:'flex', justifyContent:'center', gap:8, paddingBottom:24}}>
        <div style={{width:6,height:6,background:'white',borderRadius:'50%'}}></div>
        <div style={{width:6,height:6,background:'rgba(255,255,255,0.5)',borderRadius:'50%'}}></div>
        <div style={{width:6,height:6,background:'rgba(255,255,255,0.5)',borderRadius:'50%'}}></div>
      </div>
    </div>
  );
}
