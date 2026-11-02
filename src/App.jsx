import { useState, useRef, useEffect } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e";

const MusicLogo = () => (
  <svg viewBox="0 0 200 200" style={{width:'100%',height:'100%',filter:'drop-shadow(0 0 22px rgba(255,255,255,0.95)) drop-shadow(0 0 55px rgba(255,255,255,0.6))'}} xmlns="http://www.w3.org/2000/svg">
    <defs><mask id="mFix"><rect width="200" height="200" fill="white"/><g transform="rotate(-5 100 100)"><rect x="25" y="72" width="150" height="14" fill="black" rx="2"/><rect x="25" y="114" width="150" height="20" fill="black" rx="2"/></g><circle cx="12" cy="100" r="18" fill="black"/><circle cx="188" cy="100" r="18" fill="black"/></mask></defs>
    <circle cx="100" cy="100" r="85" fill="white" mask="url(#mFix)"/>
  </svg>
);

const CameraIconBlue = () => (
  <svg viewBox="0 0 120 80" style={{width:'120px',height:'80px'}} xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="5" width="20" height="8" rx="3" fill="#1a73e8"/>
    <path d="M 10 18 L 10 68 Q 10 78 20 78 L 95 78 Q 105 78 105 68 L 105 22 Q 105 12 95 12 L 70 12 L 62 2 L 38 2 L 30 12 Z" fill="none" stroke="#1a73e8" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx="58" cy="48" r="20" fill="none" stroke="#1a73e8" strokeWidth="6"/>
    <circle cx="88" cy="28" r="5" fill="#1a73e8"/>
  </svg>
);

export default function App(){
  const [page,setPage]=useState(0); // FIXED: Start on music (0), Lens is 1
  const [dragX,setDragX]=useState(0);
  const [isDragging,setIsDragging]=useState(false);
  const [lensState,setLensState]=useState('permission');
  const [status,setStatus]=useState('idle');
  const [result,setResult]=useState(null);
  const recRef=useRef(null);
  const streamRef=useRef(null);
  const videoRef=useRef(null);
  const cameraStreamRef=useRef(null);
  const startXRef=useRef(0);

  const getMime=()=>{ const t=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus','']; for(const x of t){ if(x===''||MediaRecorder.isTypeSupported(x)) return x; } return ''; };

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
          if(d.result){ setResult(d.result); }
          else setResult({title: d.error?.error_message || 'No match', artist:'Try louder', album:''});
        }catch{ setResult({title:'Network error', artist:'Check internet', album:''}); }
        setStatus('found');
      };
      rec.start();
      setTimeout(()=>{ if(recRef.current?.state==='recording') recRef.current.stop(); },6000);
    }catch(e){ alert('Allow microphone!'); setStatus('idle'); }
  };

  const stop=()=>{ if(recRef.current?.state==='recording') recRef.current.stop(); else { if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop()); setStatus('idle'); } };
  const openCamera=async()=>{ try{ const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); cameraStreamRef.current=s; setLensState('camera'); setTimeout(()=>{ if(videoRef.current) videoRef.current.srcObject=s; },100); }catch(e){ alert('Allow camera!'); } };
  const closeCamera=()=>{ if(cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach(t=>t.stop()); setLensState('permission'); };

  // FIXED SWIPE LOGIC - works both ways
  const handleTouchStart=(e)=>{
    startXRef.current=e.touches[0].clientX;
    setIsDragging(true);
  };
  const handleTouchMove=(e)=>{
    if(!isDragging) return;
    const currentX=e.touches[0].clientX;
    const diff=currentX-startXRef.current;
    setDragX(diff);
  };
  const handleTouchEnd=()=>{
    setIsDragging(false);
    if(dragX<-50 && page===0){
      setPage(1); // Swipe LEFT on music -> Lens
    } else if(dragX>50 && page===1){
      setPage(0); // Swipe RIGHT on Lens -> Music (FIXED!)
    }
    setDragX(0);
  };

  if(status==='found' && result){
    const art=result.spotify?.album?.images?.[0]?.url || result.apple_music?.artwork?.url?.replace('{w}x{h}','600x600') || 'https://via.placeholder.com/600';
    return(<div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'#121212',overflowY:'auto',color:'white',fontFamily:'system-ui'}}><div style={{height:'55vh',position:'relative'}}><img src={art} style={{width:'100%',height:'100%',objectFit:'cover'}}/><button onClick={()=>setStatus('idle')} style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,0.5)',border:'none',borderRadius:20,width:36,height:36,color:'white',fontSize:20}}>←</button></div><div style={{padding:20}}><div style={{fontSize:28,fontWeight:800}}>{result.title}</div><div style={{color:'#aaa',marginTop:6}}>{result.artist}</div><button onClick={()=>setStatus('idle')} style={{width:'100%',background:'#0091EA',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,marginTop:24}}>Find Another</button></div></div>);
  }
  if(status==='searching'){ return(<div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 50% -10%, #7ED8FF 0%, #2EB6FF 15%, #009CFF 50%, #007AFF 100%)',color:'white',fontFamily:'system-ui'}}><div style={{width:80,height:80,border:'4px solid rgba(255,255,255,0.3)',borderTop:'4px solid white',borderRadius:40,animation:'spin 0.8s linear infinite'}}/><div style={{marginTop:20,fontWeight:800}}>Searching ANY music...</div><style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style></div>); }

  if(lensState==='camera' && page===1){
    return(
      <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'black',overflow:'hidden',fontFamily:'system-ui'}}>
        <video ref={videoRef} autoPlay playsInline muted style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',top:0,left:0,right:0,height:60,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 12px',zIndex:10}}>
          <button onClick={()=>{closeCamera(); setPage(0);}} style={{background:'none',border:'none',color:'white',fontSize:28}}>×</button>
          <div style={{color:'white',fontWeight:700}}>FINDORA</div>
          <div style={{width:40}}/>
        </div>
        <div style={{position:'absolute',bottom:30,left:0,right:0,display:'flex',justifyContent:'center'}}>
          <button onClick={()=>window.open('https://lens.google.com/','_blank')} style={{width:76,height:76,borderRadius:38,background:'#1a73e8',border:'none',color:'white',fontSize:28}}>⌕</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,overflow:'hidden',touchAction:'pan-y'}} 
         onTouchStart={handleTouchStart} 
         onTouchMove={handleTouchMove} 
         onTouchEnd={handleTouchEnd}>
      <div style={{
        display:'flex',
        width:'200vw',
        height:'100%',
        transform:`translateX(calc(-${page*100}vw + ${dragX}px))`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      }}>
        {/* PAGE 0 - MUSIC - First dot */}
        <div style={{width:'100vw',height:'100%',flexShrink:0,position:'relative',display:'flex',flexDirection:'column',background:'radial-gradient(ellipse at 50% -10%, #9FE0FF 0%, #6ED0FF 12%, #2EB6FF 35%, #009CFF 65%, #007AFF 100%)'}}>
          <div style={{height:56,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 18px'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,color:'white',fontWeight:500}}>🔍 Search</div>
            <div style={{color:'white',fontSize:28}}>☰</div>
          </div>
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div onClick={status==='idle'?start:undefined} style={{width:'min(68vw, 320px)',height:'min(68vw, 320px)'}}><MusicLogo/></div>
          </div>
          <div style={{height:100,display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column',gap:8}}>
            {status==='listening'?<button onClick={stop} style={{background:'rgba(255,255,255,0.2)',border:'1.5px solid white',borderRadius:40,padding:'11px 28px',color:'white',fontWeight:700}}>■ Stop</button>:<><div style={{color:'white',fontSize:14,fontWeight:600}}>Tap logo to find music</div><div style={{color:'white',fontSize:12,opacity:0.8}}>Swipe LEFT → for Lens</div></>}
          </div>
          <div style={{height:60,display:'flex',justifyContent:'center',alignItems:'center',gap:14}}>
            <div style={{width:18,height:18,borderRadius:9,background:'white',border:'2px solid white'}}/>
            <div onClick={()=>setPage(1)} style={{width:12,height:12,borderRadius:6,background:'rgba(255,255,255,0.5)',cursor:'pointer'}}/>
            <div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.3)'}}/>
          </div>
        </div>

        {/* PAGE 1 - LENS PERMISSION - Middle dot - EXACTLY like your screenshot */}
        <div style={{width:'100vw',height:'100%',flexShrink:0,position:'relative',display:'flex',flexDirection:'column',background:'#1a1a1a'}}>
          <div style={{position:'absolute',inset:0,background:'url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800)',backgroundSize:'cover',backgroundPosition:'center',filter:'blur(18px) brightness(0.7)'}}/>
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)'}}/>
          <div style={{position:'relative',height:'100%',display:'flex',flexDirection:'column',zIndex:2}}>
            {/* Top bar exactly like image */}
            <div style={{height:64,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:24}}>
                <button onClick={()=>setPage(0)} style={{background:'none',border:'none',color:'white',fontSize:28,width:40,height:40}}>×</button>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/><line x1="3" y1="3" x2="21" y2="21" strokeWidth="2.5"/></svg>
              </div>
              <div style={{color:'white',fontWeight:700,letterSpacing:0.8,fontSize:18}}>FINDORA</div>
              <div style={{display:'flex',alignItems:'center',gap:20}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              </div>
            </div>
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',textAlign:'center'}}>
              <div style={{marginBottom:36}}><CameraIconBlue/></div>
              <div style={{color:'white',fontSize:15,lineHeight:'1.5',maxWidth:320,marginBottom:12}}>FINDORA uses what your camera sees to find<br/>results only while the app is open.</div>
              <div style={{fontSize:13,marginBottom:40}}><span style={{color:'#8ab4f8'}}>Privacy Policy</span><span style={{color:'white'}}> and </span><span style={{color:'#8ab4f8'}}>Terms of Service</span><span style={{color:'white'}}> apply.</span></div>
              <button onClick={openCamera} style={{background:'#c2e7ff',color:'#0b57d0',border:'none',borderRadius:28,padding:'0 24px',height:56,width:'100%',maxWidth:340,display:'flex',alignItems:'center',justifyContent:'center',gap:16,fontSize:16,fontWeight:500}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="4"/></svg>
                Open camera
              </button>
              <div style={{marginTop:20,color:'white',fontSize:12,opacity:0.6}}>Swipe RIGHT → back to Music</div>
            </div>
            {/* Bottom exactly like image */}
            <div style={{height:120,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 32px'}}>
              <div style={{width:64,height:64,borderRadius:32,background:'#202124',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#fbbc04" stroke="none"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <button onClick={openCamera} style={{width:76,height:76,borderRadius:38,background:'#1a73e8',border:'4px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.5" y2="16.5" strokeLinecap="round"/></svg>
              </button>
              <div style={{width:64,height:64}}/>
            </div>
            {/* Dots */}
            <div style={{height:40,display:'flex',justifyContent:'center',gap:14,paddingBottom:8}}>
              <div onClick={()=>setPage(0)} style={{width:12,height:12,borderRadius:6,background:'rgba(255,255,255,0.5)',cursor:'pointer'}}/>
              <div style={{width:18,height:18,borderRadius:9,background:'white'}}/>
              <div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.3)'}}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
    }
