import { useState, useRef } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e";
const ALBUMS = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300",
  "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=300",
  "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=300",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
];

export default function Findora() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

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
        if(data.result){
          setResult(data.result);
          setHistory(h=>[data.result, ...h].slice(0,5));
        } else {
          setResult({ title: "No match", artist: "Try louder / closer to speaker", spotify:{album:{images:[{url:ALBUMS[0]}]}} });
        }
        setStatus('found');
      };
      recorder.start();
      setTimeout(()=> recorder.state==='recording' && recorder.stop(), 8000);
    } catch(e){ alert("Allow Mic: " + e.message); setStatus('idle'); }
  };

  return (
    <div style={{minHeight:'100vh', position:'relative', overflow:'hidden', background:'#FFCC00', fontFamily:'system-ui'}}>
      {/* ALBUM BACKGROUND DESIGN */}
      <div style={{position:'absolute', inset:0, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4, padding:4, filter:'blur(2px)', opacity:0.65, transform:'rotate(-6deg) scale(1.25)'}}>
        {[...ALBUMS,...ALBUMS,...ALBUMS].map((s,i)=><img key={i} src={s} style={{width:'100%', aspectRatio:'1', objectFit:'cover', borderRadius:10}}/>)}
      </div>
      <div style={{position:'absolute', inset:0, background:'rgba(255,204,0,0.72)'}}></div>

      <div style={{position:'relative', zIndex:1, minHeight:'100vh', display:'flex', flexDirection:'column'}}>
        <div style={{display:'flex', justifyContent:'space-between', padding:'22px 16px', color:'white', fontSize:20}}><div>☰</div><div>🔍</div></div>
        
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{width:310, background:'white', borderRadius:26, padding:12, boxShadow:'0 25px 60px rgba(0,0,0,0.35)'}}>
            <div style={{background: status==='found' ? '#fff' : '#FF9A2E', borderRadius:20, minHeight:460, padding:16, transition:'0.3s'}}>
              {status!=='found' ? (
                <div style={{height:420, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                  <p style={{color:'white', fontWeight:700, marginBottom:36, fontSize:14}}>‹ Song finder</p>
                  <div style={{position:'relative', width:130, height:130, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {status==='listening' && <>
                      <div style={{position:'absolute', width:130, height:130, borderRadius:'50%', background:'rgba(255,255,255,0.35)', animation:'pulse 1.5s infinite'}}></div>
                      <div style={{position:'absolute', width:170, height:170, borderRadius:'50%', background:'rgba(255,255,255,0.18)', animation:'pulse 1.5s infinite 0.5s'}}></div>
                      <div style={{position:'absolute', width:210, height:210, borderRadius:'50%', background:'rgba(255,255,255,0.1)', animation:'pulse 1.5s infinite 1s'}}></div>
                    </>}
                    <button onClick={status==='idle' ? startListening : undefined} style={{width:86, height:86, background:'white', borderRadius:'50%', border:'none', fontSize:36, zIndex:2, boxShadow:'0 8px 20px rgba(0,0,0,0.2)'}}>🎤</button>
                  </div>
                  <p style={{color:'white', marginTop:36, fontWeight:600, fontSize:14}}>{status==='idle' ? 'Find Song' : 'We are listening...'}</p>
                  <p style={{color:'rgba(255,255,255,0.8)', fontSize:11, marginTop:6}}>{status==='idle' ? 'Find the name of any song' : 'Keep phone near music'}</p>
                </div>
              ) : (
                <div>
                  <p style={{fontWeight:800, fontSize:14}}>‹ Song finder <span style={{fontWeight:400, opacity:0.5, marginLeft:8}}>Recent search</span></p>
                  <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:10}}>
                    {[result, ...history].filter(Boolean).slice(0,5).map((s,i)=>(
                      <div key={i} style={{background:'#F8F8F8', borderRadius:14, padding:'10px', display:'flex', gap:10, alignItems:'center'}}>
                        <img src={s.spotify?.album?.images?.[0]?.url || s.apple_music?.artwork?.url?.replace('{w}x{h}','100x100') || ALBUMS[i % ALBUMS.length]} style={{width:44, height:44, borderRadius:10, objectFit:'cover'}} alt=""/>
                        <div style={{flex:1, overflow:'hidden'}}><div style={{fontSize:12, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{s.title}</div><div style={{fontSize:10, color:'#777'}}>{s.artist}</div></div>
                        <div style={{background:'#00C851', color:'white', borderRadius:20, padding:'5px 12px', fontSize:10, fontWeight:600}}>Open</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setStatus('idle')} style={{marginTop:16, width:'100%', background:'#FFCC00', border:'none', padding:14, borderRadius:12, fontWeight:800}}>Tap to Listen Again</button>
                  <p style={{fontSize:10, color:'#999', textAlign:'center', marginTop:10}}>Listening for 8 seconds...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <style>{`@keyframes pulse{0%{transform:scale(0.85);opacity:1}100%{transform:scale(1.5);opacity:0}}`}</style>
        <div style={{display:'flex', justifyContent:'center', gap:8, paddingBottom:24}}><div style={{width:7,height:7,background:'white',borderRadius:50}}></div><div style={{width:7,height:7,background:'rgba(255,255,255,0.5)',borderRadius:50}}></div><div style={{width:7,height:7,background:'rgba(255,255,255,0.5)',borderRadius:50}}></div></div>
      </div>
    </div>
  );
}
