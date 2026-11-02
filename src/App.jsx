import { useState, useRef, useEffect } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e";

// SHARP SVG LOGO - never breaks, exactly like your screenshot
const Logo = () => (
  <svg viewBox="0 0 200 200" style={{width:'100%',height:'100%',filter:'drop-shadow(0 0 22px rgba(255,255,255,0.95)) drop-shadow(0 0 55px rgba(255,255,255,0.6))'}} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="cut">
        <rect width="200" height="200" fill="white"/>
        <g transform="rotate(-5 100 100)">
          <rect x="25" y="72" width="150" height="14" fill="black" rx="2"/>
          <rect x="25" y="114" width="150" height="20" fill="black" rx="2"/>
        </g>
        <circle cx="12" cy="100" r="18" fill="black"/>
        <circle cx="188" cy="100" r="18" fill="black"/>
      </mask>
    </defs>
    <circle cx="100" cy="100" r="85" fill="white" mask="url(#cut)"/>
  </svg>
);

export default function App(){
  const [page,setPage]=useState(0);
  const [lensState,setLensState]=useState('permission');
  const [status,setStatus]=useState('idle');
  const [result,setResult]=useState(null);
  const [history,setHistory]=useState([]);
  const [menuOpen,setMenuOpen]=useState(false);
  const recRef=useRef(null);
  const streamRef=useRef(null);
  const videoRef=useRef(null);
  const cameraStreamRef=useRef(null);
  const touchStartX=useRef(0);

  useEffect(()=>{ const h=JSON.parse(localStorage.getItem('findora_history')||'[]'); setHistory(h); },[]);

  const saveHistory=(song)=>{
    const h=JSON.parse(localStorage.getItem('findora_history')||'[]');
    const newH=[song,...h.filter(s=>s.title!==song.title)].slice(0,50);
    localStorage.setItem('findora_history',JSON.stringify(newH));
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
          if(d.result){ setResult(d.result); saveHistory(d.result); }
          else setResult({title: d.error?.error_message || 'No match', artist:'Try louder, closer to speaker', album:''});
        }catch{ setResult({title:'Network error', artist:'Check internet', album:''}); }
        setStatus('found');
      };
      rec.start();
      setTimeout(()=>{ if(recRef.current?.state==='recording') recRef.current.stop(); },6000);
    }catch(e){ alert('Allow microphone!'); setStatus('idle'); }
  };

  const stop=()=>{ if(recRef.current?.state==='recording') recRef.current.stop(); else { if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop()); setStatus('idle'); } };

  const openCamera=async()=>{
    try{
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
      cameraStreamRef.current=s;
      setLensState('camera');
      setTimeout(()=>{ if(videoRef.current) videoRef.current.srcObject=s; },100);
    }catch(e){ alert('Allow camera permission!'); }
  };

  const closeCamera=()=>{
    if(cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach(t=>t.stop());
    setLensState('permission');
  };

  const handleTouchStart=(e)=>{ touchStartX.current=e.touches[0].clientX; };
  const handleTouchEnd=(e)=>{
    const diff=e.changedTouches[0].clientX-touchStartX.current;
    if(Math.abs(diff)>80){
      if(diff<0 && page<1) setPage(p=>p+1);
      if(diff>0 && page>0) setPage(p=>p-1);
    }
  };

  const captureAndSearch=()=>{
    alert('📸 Image captured! Opening Google Lens... Free, does NOT use music chances!');
    window.open('https://lens.google.com/','_blank');
  };

  if(status==='found' && result){
    const art=result.spotify?.album?.images?.[0]?.url || result.apple_music?.artwork?.url?.replace('{w}x{h}','600x600') || 'https://via.placeholder.com/600';
    return(
      <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'#121212',overflowY:'auto',color:'white',fontFamily:'system-ui'}}>
        <div style={{height:'55vh',position:'relative'}}><img src={art} style={{width:'100%',height:'100%',objectFit:'cover'}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, transparent 40%, #121212 100%)'}}/><button onClick={()=>setStatus('idle')} style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,0.5)',border:'none',borderRadius:20,width:36,height:36,color:'white',fontSize:20}}>←</button></div>
        <div style={{padding:20}}><div style={{fontSize:28,fontWeight:800}}>{result.title}</div><div style={{color:'#aaa',marginTop:6}}>{result.artist}</div><button onClick={()=>setStatus('idle')} style={{width:'100%',background:'#0091EA',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,marginTop:24}}>Find Another</button></div>
      </div>
    );
  }

  if(status==='searching'){
    return(<div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 50% -10%, #7ED8FF 0%, #2EB6FF 15%, #009CFF 50%, #007AFF 100%)',color:'white',fontFamily:'system-ui'}}><div style={{width:80,height:80,border:'4px solid rgba(255,255,255,0.3)',borderTop:'4px solid white',borderRadius:40,animation:'spin 0.8s linear infinite'}}/><div style={{marginTop:20,fontWeight:800}}>Searching ANY music...</div><style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style></div>);
  }

  if(page===1){
    if(lensState==='camera'){
      return(
        <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'black',overflow:'hidden',fontFamily:'system-ui'}} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <video ref={videoRef} autoPlay playsInline muted style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',top:0,left:0,right:0,height:56,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 12px',background:'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',zIndex:2}}>
            <div style={{display:'flex',gap:16,alignItems:'center'}}><button onClick={()=>{closeCamera(); setPage(0);}} style={{background:'none',border:'none',color:'white',fontSize:24}}>←</button><span style={{color:'white',fontSize:18,opacity:0.7}}>✈̶</span></div>
            <div style={{color:'white',fontWeight:800,letterSpacing:1}}>FINDORA</div>
            <div style={{display:'flex',gap:16,alignItems:'center'}}><span style={{color:'white',fontSize:20}}>🕒</span><span style={{color:'white',fontSize:22}}>☰</span></div>
          </div>
          <div style={{position:'absolute',top:'30%',left:'15%',right:'15%',bottom:'30%',pointerEvents:'none',zIndex:1}}>
            <div style={{position:'absolute',top:0,left:0,width:30,height:30,borderTop:'2px solid white',borderLeft:'2px solid white',borderTopLeftRadius:12}}/>
            <div style={{position:'absolute',top:0,right:0,width:30,height:30,borderTop:'2px solid white',borderRight:'2px solid white',borderTopRightRadius:12}}/>
            <div style={{position:'absolute',bottom:0,left:0,width:30,height:30,borderBottom:'2px solid white',borderLeft:'2px solid white',borderBottomLeftRadius:12}}/>
            <div style={{position:'absolute',bottom:0,right:0,width:30,height:30,borderBottom:'2px solid white',borderRight:'2px solid white',borderBottomRightRadius:12}}/>
          </div>
          <div style={{position:'absolute',bottom:180,left:'50%',transform:'translateX(-50%)',background:'white',borderRadius:20,padding:'8px 16px',display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,zIndex:2}}><span>◫</span> select text</div>
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'20px 20px 30px',display:'flex',flexDirection:'column',alignItems:'center',gap:16,zIndex:2}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
              <div style={{width:56,height:56,borderRadius:28,overflow:'hidden',border:'2px solid white'}}><img src="https://picsum.photos/100" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
              <button onClick={captureAndSearch} style={{width:72,height:72,borderRadius:36,background:'#1a73e8',border:'4px solid rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:28}}>⌕</button>
              <div style={{width:56,height:56}}/>
            </div>
            <div style={{background:'rgba(0,0,0,0.7)',borderRadius:30,padding:'10px 20px',display:'flex',gap:32,color:'white',fontSize:12}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}><span style={{fontSize:18}}>⌕</span><span>Search</span></div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,opacity:0.7}}><span style={{fontSize:18}}>文A</span><span>Translate</span></div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,opacity:0.7}}><span style={{fontSize:18}}>◐</span><span>Talk</span></div>
            </div>
          </div>
          <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',gap:8,zIndex:2}}><div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.4)'}}/><div style={{width:8,height:8,borderRadius:4,background:'white'}}/><div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.4)'}}/></div>
        </div>
      );
    }
    return(
      <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'url(https://picsum.photos/800/1200?blur=10)',backgroundSize:'cover',overflow:'hidden',fontFamily:'system-ui'}} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)',backdropFilter:'blur(20px)'}}/>
        <div style={{position:'relative',height:'100%',display:'flex',flexDirection:'column',zIndex:2}}>
          <div style={{height:56,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 16px'}}>
            <div style={{display:'flex',gap:20,alignItems:'center'}}><button onClick={()=>setPage(0)} style={{background:'none',border:'none',color:'white',fontSize:28}}>×</button><span style={{color:'white',fontSize:18,opacity:0.8}}>✈̶</span></div>
            <div style={{color:'white',fontWeight:800,letterSpacing:1,fontSize:18}}>FINDORA</div>
            <div style={{display:'flex',gap:16,alignItems:'center'}}><span style={{color:'white',fontSize:20}}>🕒</span><span style={{color:'white',fontSize:24}}>☰</span></div>
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,textAlign:'center'}}>
            <div style={{width:120,height:120,marginBottom:32}}><svg viewBox="0 0 100 100" style={{width:'100%',height:'100%'}}><path d="M15 25 L15 75 Q15 85 25 85 L75 85 Q85 85 85 75 L85 35 Q85 25 75 25 L60 25 L52 15 L38 15 L30 25 Z" fill="none" stroke="#1a73e8" strokeWidth="6" strokeLinejoin="round"/><circle cx="50" cy="55" r="18" fill="none" stroke="#1a73e8" strokeWidth="5"/><circle cx="72" cy="32" r="4" fill="#1a73e8"/><rect x="22" y="12" width="18" height="6" rx="3" fill="#1a73e8"/></svg></div>
            <div style={{color:'white',fontSize:15,lineHeight:'1.5',maxWidth:320,marginBottom:8}}>FINDORA uses what your camera sees to find results only while the app is open.</div>
            <div style={{color:'#8ab4f8',fontSize:13,marginBottom:32}}><span style={{textDecoration:'underline'}}>Privacy Policy</span> and <span style={{textDecoration:'underline'}}>Terms of Service</span> apply.</div>
            <button onClick={openCamera} style={{background:'#c2e7ff',color:'#0b57d0',border:'none',borderRadius:24,padding:'14px 24px',width:'100%',maxWidth:320,display:'flex',alignItems:'center',justifyContent:'center',gap:12,fontSize:16,fontWeight:600}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="4"/></svg>Open camera</button>
          </div>
          <div style={{height:100,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 40px'}}>
            <div style={{width:56,height:56,borderRadius:28,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:22}}>🖼️</div>
            <button onClick={openCamera} style={{width:72,height:72,borderRadius:36,background:'#1a73e8',border:'4px solid rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:28}}>⌕</button>
            <div style={{width:56}}/>
          </div>
          <div style={{height:44,display:'flex',justifyContent:'center',gap:8,paddingBottom:8}}><div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.4)'}}/><div style={{width:8,height:8,borderRadius:4,background:'white'}}/><div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.4)'}}/></div>
        </div>
      </div>
    );
  }

  return(
    <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',background:'radial-gradient(ellipse at 50% -10%, #9FE0FF 0%, #6ED0FF 12%, #2EB6FF 35%, #009CFF 65%, #007AFF 100%)',overflow:'hidden',fontFamily:'system-ui'}} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}><div style={{fontSize:22,fontWeight:800}}>My Music</div><button onClick={()=>setMenuOpen(false)} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:20,width:36,height:36,color:'white',fontSize:20}}>×</button></div>
            <div style={{background:'#1e1e1e',borderRadius:12,padding:12,display:'flex',gap:10,alignItems:'center',marginBottom:20}}><div style={{width:40,height:40,background:'#2EB6FF',borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center'}}>♪</div><div><div style={{fontWeight:700}}>Findora</div><div style={{fontSize:12,color:'#aaa'}}>{history.length} songs</div></div></div>
            <div style={{fontSize:13,fontWeight:800,letterSpacing:1,marginBottom:12,color:'#aaa'}}>RECENT</div>
            {history.length===0 ? <div style={{color:'#666',fontSize:14,padding:'20px 0'}}>No songs yet.</div> : history.map((song,i)=>(
              <div key={i} onClick={()=>{setResult(song); setMenuOpen(false); setStatus('found');}} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:'1px solid #222',cursor:'pointer'}}><img src={song.spotify?.album?.images?.[1]?.url || 'https://via.placeholder.com/60'} style={{width:56,height:56,borderRadius:8,objectFit:'cover'}}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{song.title}</div><div style={{fontSize:12,color:'#999'}}>{song.artist}</div></div></div>
            ))}
          </div>
        </div>
      )}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:2}}>
        <div onClick={status==='idle'?start:undefined} style={{width:'min(68vw, 320px)',height:'min(68vw, 320px)',cursor:status==='idle'?'pointer':'default',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {status==='listening'&&<><div style={{position:'absolute',inset:-12,borderRadius:'50%',background:'rgba(255,255,255,0.22)',animation:'p 1.4s infinite'}}/><div style={{position:'absolute',inset:-32,borderRadius:'50%',background:'rgba(255,255,255,0.12)',animation:'p 1.4s infinite 0.5s'}}/></>}
          <div style={{width:'100%',height:'100%'}}><Logo/></div>
        </div>
      </div>
      <div style={{height:90,display:'flex',justifyContent:'center',alignItems:'flex-start',position:'relative',zIndex:2,flexDirection:'column',alignItems:'center',gap:6}}>
        {status==='listening'&&<button onClick={stop} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.18)',border:'1.5px solid white',borderRadius:40,padding:'11px 28px',color:'white',fontSize:16,fontWeight:700,backdropFilter:'blur(10px)'}}><div style={{width:16,height:16,background:'white',borderRadius:2}}/>Stop</button>}
        {status==='idle'&&<div style={{color:'white',fontSize:13,opacity:0.9}}>Tap to find • Swipe → for Lens</div>}
      </div>
      <div style={{height:44,display:'flex',justifyContent:'center',alignItems:'center',gap:8,position:'relative',zIndex:2}}>
        <div onClick={()=>setPage(0)} style={{width:8,height:8,borderRadius:50,background:page===0?'white':'rgba(255,255,255,0.4)',cursor:'pointer'}}/>
        <div onClick={()=>setPage(1)} style={{width:8,height:8,borderRadius:50,background:page===1?'white':'rgba(255,255,255,0.4)',cursor:'pointer'}}/>
        <div style={{width:8,height:8,borderRadius:50,background:'rgba(255,255,255,0.4)'}}/>
      </div>
      <style>{`@keyframes p{0%{transform:scale(0.9);opacity:1}100%{transform:scale(1.5);opacity:0}}`}</style>
    </div>
  );
          }
