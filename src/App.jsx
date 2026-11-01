import { useState, useRef } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e";

const Logo = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%" style={{filter:'drop-shadow(0 0 25px rgba(255,255,255,0.9)) drop-shadow(0 0 60px rgba(255,255,255,0.5))'}}>
    <defs><mask id="logoMask2"><rect width="120" height="120" fill="white"/><g transform="rotate(-14 60 60)"><rect x="22" y="46" width="76" height="7" rx="1.5" fill="black"/><rect x="22" y="68" width="76" height="12" rx="2" fill="black"/></g><circle cx="18" cy="60" r="12" fill="black"/><circle cx="102" cy="60" r="12" fill="black"/></mask></defs>
    <circle cx="60" cy="60" r="48" fill="white" mask="url(#logoMask2)"/>
  </svg>
);

export default function App(){
  const [status,setStatus]=useState('idle');
  const [result,setResult]=useState(null);
  const [showLyrics,setShowLyrics]=useState(false);
  const [isPlaying,setIsPlaying]=useState(false);
  const recRef=useRef(null);
  const streamRef=useRef(null);
  const audioRef=useRef(null);

  const start=async()=>{
    try{
      setStatus('listening');
      const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false, autoGainControl:false, noiseSuppression:false, sampleRate:44100}});
      streamRef.current=s;
      const rec=new MediaRecorder(s,{mimeType:'audio/webm;codecs=opus', audioBitsPerSecond:64000});
      recRef.current=rec;
      const ch=[];
      rec.ondataavailable=e=>{ if(e.data.size>0) ch.push(e.data); };
      rec.onstop=async()=>{
        const b=new Blob(ch,{type:'audio/webm'});
        const f=new File([b],"clip.webm");
        if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
        if(ch.length===0){setStatus('idle');return;}
        setStatus('searching');
        const fd=new FormData(); fd.append('file',f); fd.append('api_token',AUDD_TOKEN); fd.append('return','spotify,apple_music'); fd.append('skip_saving','true');
        try{
          const controller=new AbortController();
          setTimeout(()=>controller.abort(),8000);
          const r=await fetch('https://api.audd.io/',{method:'POST',body:fd,signal:controller.signal});
          const d=await r.json();
          if(d.result){ setResult(d.result); setStatus('found'); } else { setResult({title:"No match",artist:"Try louder"}); setStatus('found'); }
        }catch{ setResult({title:"No match",artist:"Try again"}); setStatus('found'); }
      };
      rec.start(100);
      setTimeout(()=>{if(recRef.current?.state==='recording') recRef.current.stop();},3500);
    }catch{setStatus('idle');}
  };

  const stop=()=>{ if(recRef.current?.state==='recording') recRef.current.stop(); else { if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop()); setStatus('idle'); } };
  const togglePlay=()=>{ if(!audioRef.current) return; if(isPlaying){ audioRef.current.pause(); setIsPlaying(false); } else { audioRef.current.play().then(()=>setIsPlaying(true)).catch(()=>{}); } };

  if(showLyrics && result){
    return(<div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'linear-gradient(to bottom, #A84A2D 0%, #6B2A15 30%, #121212 100%)',overflowY:'auto',color:'white',fontFamily:'system-ui'}}><div style={{height:56,display:'flex',alignItems:'center',gap:12,padding:'0 16px',position:'sticky',top:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(12px)'}}><button onClick={()=>setShowLyrics(false)} style={{background:'none',border:'none',color:'white',fontSize:26}}>←</button><span style={{fontWeight:800}}>{result.title}</span></div><div style={{padding:'30px 20px',textAlign:'center',lineHeight:'30px',whiteSpace:'pre-wrap'}}>Lyrics for {result.title}</div></div>);
  }

  if(status==='found' && result){
    const albumArt = result.spotify?.album?.images?.[0]?.url || result.apple_music?.artwork?.url?.replace('{w}x{h}','600x600') || "https://picsum.photos/600/600?random=1";
    const previewUrl = result.spotify?.preview_url || result.apple_music?.previewUrl || "";
    const title = result.title||"MENTA MÁ"; const artist = result.artist||"Nakama & Mc Staff"; const album = result.album||title;
    return(
      <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'#121212',overflowY:'auto',color:'white',fontFamily:'system-ui'}}>
        {previewUrl && <audio ref={audioRef} src={previewUrl} onEnded={()=>setIsPlaying(false)} />}
        <div style={{height:'58vh',minHeight:400,position:'relative'}}><img src={albumArt} style={{width:'100%',height:'100%',objectFit:'cover'}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 70%, #121212 100%)'}}/><button onClick={()=>setStatus('idle')} style={{position:'absolute',top:12,left:10,background:'rgba(0,0,0,0.5)',border:'none',borderRadius:20,width:36,height:36,color:'white',fontSize:22}}>←</button><button onClick={()=>setShowLyrics(true)} style={{position:'absolute',top:12,right:12,background:'rgba(60,60,90,0.85)',border:'none',borderRadius:20,padding:'7px 14px',color:'white',fontSize:12,fontWeight:800}}>♪ LYRICS</button><button onClick={togglePlay} style={{position:'absolute',bottom:16,right:16,width:58,height:58,background:'white',borderRadius:29,border:'none',fontSize:22,color:'black'}}>{isPlaying?'❚❚':'▶'}</button></div>
        <div style={{padding:'18px 16px 40px'}}>
          <div style={{fontSize:30,fontWeight:900}}>{title}</div><div style={{fontSize:15,color:'#aaa',marginTop:6}}>{artist} • {album}</div>
          <div style={{display:'flex',gap:8,marginTop:14}}><div style={{background:'#252525',padding:'7px 12px',borderRadius:20,fontSize:12}}>◎ 992,852</div><div style={{background:'#252525',padding:'7px 12px',borderRadius:20,fontSize:12}}>♪ Audiomack ↗</div></div>
          <button style={{width:'100%',background:'#FF5A2B',color:'white',border:'none',padding:16,borderRadius:14,fontWeight:800,marginTop:18}}>Share song</button>
          <div style={{fontWeight:900,letterSpacing:1,marginTop:32,marginBottom:12,fontSize:13}}>TOP SONGS</div><div style={{display:'flex',gap:12,padding:'10px 0'}}><img src={albumArt} style={{width:72,height:72,borderRadius:8}}/><div style={{flex:1}}><div style={{fontWeight:800}}>{title}</div><div style={{fontSize:12,color:'#999'}}>{artist}</div></div></div>
          <div style={{fontWeight:900,letterSpacing:1,marginTop:30,fontSize:13}}>VIDEO</div><div style={{height:190,background:'#1e1e1e',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',marginTop:10}}>▶ Video</div>
          <div style={{fontWeight:900,letterSpacing:1,marginTop:30,marginBottom:16,fontSize:13}}>TRACK INFORMATION</div>
          <div style={{display:'flex',flexDirection:'column',gap:14,fontSize:14}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#888'}}>Track:</span><span style={{fontWeight:700}}>{title}</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#888'}}>Artist:</span><span style={{fontWeight:700}}>{artist}</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#888'}}>Released:</span><span style={{fontWeight:700}}>2025</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#888'}}>Recognised:</span><span style={{fontWeight:700}}>Just now • 3.5s ⚡ Faster than Shazam</span></div>
          </div>
          <button onClick={()=>setStatus('idle')} style={{width:'100%',background:'#0091EA',color:'white',border:'none',padding:15,borderRadius:12,fontWeight:800,marginTop:32,marginBottom:50}}>Find Another Song</button>
        </div>
      </div>
    );
  }

  if(status==='searching'){
    return(<div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 50% -10%, #7ED8FF 0%, #2EB6FF 15%, #009CFF 50%, #007AFF 100%)',color:'white',fontFamily:'system-ui'}}><div style={{width:80,height:80,border:'4px solid rgba(255,255,255,0.3)',borderTop:'4px solid white',borderRadius:40,animation:'spin 0.8s linear infinite'}}/><div style={{marginTop:20,fontWeight:800,fontSize:18}}>Searching... ⚡</div><div style={{fontSize:13,opacity:0.8,marginTop:6}}>Faster than Shazam • 3.5s</div><style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style></div>);
  }

  return(
    <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',background:'radial-gradient(ellipse at 50% -10%, #7ED8FF 0%, #2EB6FF 15%, #009CFF 50%, #007AFF 100%)',overflow:'hidden',fontFamily:'system-ui'}}>
      <div style={{height:56,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 18px'}}><div style={{display:'flex',alignItems:'center',gap:7,color:'white'}}><span>🔍</span><span style={{fontWeight:700}}>Search</span></div><div style={{width:26,height:20,display:'flex',flexDirection:'column',justifyContent:'space-between'}}><div style={{height:3,background:'white',borderRadius:2}}/><div style={{height:3,background:'white',borderRadius:2}}/><div style={{height:3,background:'white',borderRadius:2}}/></div></div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}><div onClick={status==='idle'?start:undefined} style={{width:'min(70vw, 300px)',height:'min(70vw, 300px)',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>{status==='listening'&&<><div style={{position:'absolute',inset:-12,borderRadius:'50%',background:'rgba(255,255,255,0.22)',animation:'p 1.4s infinite'}}/><div style={{position:'absolute',inset:-30,borderRadius:'50%',background:'rgba(255,255,255,0.12)',animation:'p 1.4s infinite 0.5s'}}/></>}<Logo/></div></div>
      <div style={{height:90,display:'flex',justifyContent:'center',flexDirection:'column',alignItems:'center',gap:6}}>{status==='listening'&&<><button onClick={stop} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.18)',border:'1.5px solid white',borderRadius:40,padding:'11px 30px',color:'white',fontWeight:700}}>■ Stop</button><div style={{fontSize:12,color:'white'}}>Listening 3.5s ⚡ Faster than Shazam</div></>}{status==='idle'&&<div style={{fontSize:12,color:'white',opacity:0.8}}>Tap to find • 3.5s recognition</div>}</div>
      <div style={{height:44,display:'flex',justifyContent:'center',gap:8}}><div style={{width:7,height:7,borderRadius:50,background:status==='idle'?'white':'rgba(255,255,255,0.4)'}}/><div style={{width:7,height:7,borderRadius:50,background:status==='listening'?'white':'rgba(255,255,255,0.4)'}}/><div style={{width:7,height:7,borderRadius:50,background:status==='found'?'white':'rgba(255,255,255,0.4)'}}/></div>
      <style>{`@keyframes p{0%{transform:scale(0.9);opacity:1}100%{transform:scale(1.5);opacity:0}}`}</style>
    </div>
  );
    }
