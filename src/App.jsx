import { useState, useRef, useEffect } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e";
const LOGO = "data:image/png;base64,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";

export default function App(){
  const [status,setStatus]=useState('idle');
  const [result,setResult]=useState(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const [history,setHistory]=useState([]);
  const recRef=useRef(null);
  const streamRef=useRef(null);

  useEffect(()=>{
    const h = JSON.parse(localStorage.getItem('findora_history')||'[]');
    setHistory(h);
  },[]);

  const saveHistory=(song)=>{
    const h = JSON.parse(localStorage.getItem('findora_history')||'[]');
    const newH = [song, ...h.filter(s=>s.title!==song.title)].slice(0,50);
    localStorage.setItem('findora_history', JSON.stringify(newH));
    setHistory(newH);
  };

  const getMime=()=>{
    const t=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus',''];
    for(const x of t){ if(x===''||MediaRecorder.isTypeSupported(x)) return x; }
    return '';
  };

  const start=async()=>{
    try{
      setStatus('listening');
      const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false, autoGainControl:false, noiseSuppression:false, sampleRate:44100}});
      streamRef.current=s;
      const mime=getMime();
      const rec=new MediaRecorder(s, mime?{mimeType:mime}:undefined);
      recRef.current=rec;
      const ch=[];
      rec.ondataavailable=e=>{ if(e.data.size>0) ch.push(e.data); };
      rec.onstop=async()=>{
        const blob=new Blob(ch,{type:mime||'audio/webm'});
        const ext=mime.includes('mp4')?'m4a': mime.includes('ogg')?'ogg':'webm';
        const file=new File([blob], `song.${ext}`, {type: blob.type});
        if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
        if(ch.length===0){setStatus('idle');return;}
        setStatus('searching');
        const fd=new FormData();
        fd.append('file',file);
        fd.append('api_token',AUDD_TOKEN);
        fd.append('return','spotify,apple_music');
        try{
          const r=await fetch('https://api.audd.io/',{method:'POST',body:fd});
          const d=await r.json();
          if(d.result){
            setResult(d.result);
            saveHistory(d.result);
          } else {
            setResult({title: d.error?.error_message || 'No match', artist:'Try louder, closer to speaker', album:''});
          }
        }catch{ setResult({title:'Network error', artist:'Check internet', album:''}); }
        setStatus('found');
      };
      rec.start();
      setTimeout(()=>{ if(recRef.current?.state==='recording') recRef.current.stop(); },6000);
    }catch(e){ alert('Allow microphone permission!'); setStatus('idle'); }
  };

  const stop=()=>{ if(recRef.current?.state==='recording') recRef.current.stop(); else { if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop()); setStatus('idle'); } };

  if(status==='found' && result){
    const art = result.spotify?.album?.images?.[0]?.url || result.apple_music?.artwork?.url?.replace('{w}x{h}','600x600') || 'https://via.placeholder.com/600';
    return(
      <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'#121212',overflowY:'auto',color:'white',fontFamily:'system-ui'}}>
        <div style={{height:'55vh',position:'relative'}}><img src={art} style={{width:'100%',height:'100%',objectFit:'cover'}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, transparent 40%, #121212 100%)'}}/><button onClick={()=>setStatus('idle')} style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,0.5)',border:'none',borderRadius:20,width:36,height:36,color:'white',fontSize:20}}>←</button></div>
        <div style={{padding:20}}><div style={{fontSize:28,fontWeight:800}}>{result.title}</div><div style={{color:'#aaa',marginTop:6}}>{result.artist}</div><button onClick={()=>setStatus('idle')} style={{width:'100%',background:'#0091EA',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,marginTop:24}}>Find Another Song</button></div>
      </div>
    );
  }

  if(status==='searching'){
    return(<div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 50% -10%, #7ED8FF 0%, #2EB6FF 15%, #009CFF 50%, #007AFF 100%)',color:'white',fontFamily:'system-ui'}}><div style={{width:80,height:80,border:'4px solid rgba(255,255,255,0.3)',borderTop:'4px solid white',borderRadius:40,animation:'spin 0.8s linear infinite'}}/><div style={{marginTop:20,fontWeight:800}}>Searching ANY music...</div><style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style></div>);
  }

  return(
    <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',background:'radial-gradient(ellipse at 50% -10%, #9FE0FF 0%, #6ED0FF 12%, #2EB6FF 35%, #009CFF 65%, #007AFF 100%)',overflow:'hidden',fontFamily:'system-ui'}}>
      <div style={{position:'absolute',top:-50,left:-50,width:300,height:300,background:'rgba(255,255,255,0.22)',borderRadius:'50%',filter:'blur(40px)'}}/>
      <div style={{position:'absolute',top:100,right:-80,width:400,height:400,background:'rgba(100,200,255,0.28)',borderRadius:'50%',filter:'blur(50px)'}}/>
      <div style={{height:56,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 18px',position:'relative',zIndex:2}}>
        <div style={{display:'flex',alignItems:'center',gap:8,color:'white'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><circle cx="11" cy="11" r="6"/><line x1="16" y1="16" x2="21" y2="21" strokeLinecap="round"/></svg><span style={{fontSize:16,fontWeight:600}}>Search</span></div>
        <button onClick={()=>setMenuOpen(true)} style={{background:'none',border:'none',padding:0}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
      </div>

      {menuOpen && (
        <div style={{position:'fixed',inset:0,zIndex:50,display:'flex'}}>
          <div onClick={()=>setMenuOpen(false)} style={{flex:1,background:'rgba(0,0,0,0.4)'}}/>
          <div style={{width:'85%',maxWidth:340,background:'#0f0f0f',height:'100%',overflowY:'auto',padding:'20px 16px',color:'white'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <div style={{fontSize:22,fontWeight:800}}>My Music</div>
              <button onClick={()=>setMenuOpen(false)} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:20,width:36,height:36,color:'white',fontSize:20}}>×</button>
            </div>
            <div style={{background:'#1e1e1e',borderRadius:12,padding:12,display:'flex',gap:10,alignItems:'center',marginBottom:20}}>
              <div style={{width:40,height:40,background:'#2EB6FF',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center'}}>♪</div>
              <div><div style={{fontWeight:700}}>Findora</div><div style={{fontSize:12,color:'#aaa'}}>{history.length} songs found</div></div>
            </div>
            <div style={{fontSize:13,fontWeight:800,letterSpacing:1,marginBottom:12,color:'#aaa'}}>RECENT SEARCHES</div>
            {history.length===0 ? (
              <div style={{color:'#666',fontSize:14,padding:'20px 0'}}>No songs yet. Tap logo to find music!</div>
            ) : history.map((song,i)=>(
              <div key={i} onClick={()=>{setResult(song); setMenuOpen(false); setStatus('found');}} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:'1px solid #222',cursor:'pointer'}}>
                <img src={song.spotify?.album?.images?.[1]?.url || 'https://via.placeholder.com/60'} style={{width:56,height:56,borderRadius:8,objectFit:'cover'}}/>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{song.title}</div><div style={{fontSize:12,color:'#999'}}>{song.artist}</div></div>
              </div>
            ))}
            {history.length>0 && <button onClick={()=>{localStorage.removeItem('findora_history'); setHistory([]);}} style={{width:'100%',background:'#222',color:'#aaa',border:'none',padding:12,borderRadius:10,marginTop:20,fontSize:13}}>Clear History</button>}
            <div style={{marginTop:30,padding:12,background:'linear-gradient(135deg, #2EB6FF, #007AFF)',borderRadius:12}}>
              <div style={{fontWeight:800}}>Search any music</div><div style={{fontSize:12,marginTop:4,opacity:0.9}}>Tap logo, play music near phone, find in 6s</div>
            </div>
          </div>
        </div>
      )}

      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:2}}>
        <div onClick={status==='idle'?start:undefined} style={{width:'min(68vw, 320px)',height:'min(68vw, 320px)',cursor:status==='idle'?'pointer':'default',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {status==='listening'&&<><div style={{position:'absolute',inset:-12,borderRadius:'50%',background:'rgba(255,255,255,0.22)',animation:'p 1.4s infinite'}}/><div style={{position:'absolute',inset:-32,borderRadius:'50%',background:'rgba(255,255,255,0.12)',animation:'p 1.4s infinite 0.5s'}}/></>}
          <img src={LOGO} alt="logo" style={{width:'100%',height:'100%',objectFit:'contain',filter:'drop-shadow(0 0 22px rgba(255,255,255,0.95)) drop-shadow(0 0 55px rgba(255,255,255,0.6))'}}/>
        </div>
      </div>
      <div style={{height:90,display:'flex',justifyContent:'center',alignItems:'flex-start',position:'relative',zIndex:2,flexDirection:'column',alignItems:'center',gap:6}}>
        {status==='listening'&&<button onClick={stop} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.18)',border:'1.5px solid white',borderRadius:40,padding:'11px 28px',color:'white',fontSize:16,fontWeight:700,backdropFilter:'blur(10px)'}}><div style={{width:16,height:16,background:'white',borderRadius:2}}/>Stop</button>}
        {status==='idle'&&<><div style={{color:'white',fontSize:13,opacity:0.9}}>Tap to find • 6s recognition</div><div style={{color:'white',fontSize:11,opacity:0.6,marginTop:2}}>Works with any music</div></>}
      </div>
      <div style={{height:44,display:'flex',justifyContent:'center',alignItems:'center',gap:8,position:'relative',zIndex:2}}><div style={{width:8,height:8,borderRadius:50,background:status==='idle'?'white':'rgba(255,255,255,0.4)'}}/><div style={{width:8,height:8,borderRadius:50,background:status==='listening'?'white':'rgba(255,255,255,0.4)'}}/><div style={{width:8,height:8,borderRadius:50,background:status==='found'?'white':'rgba(255,255,255,0.4)'}}/></div>
      <style>{`@keyframes p{0%{transform:scale(0.9);opacity:1}100%{transform:scale(1.5);opacity:0}}`}</style>
    </div>
  );
      }
