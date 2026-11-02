import { useState, useRef, useEffect } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e";

// Music Logo EXACTLY like your blue image - horizontal bars, no tilt
const MusicLogoExact = () => (
  <svg viewBox="0 0 200 200" style={{width:'100%',height:'100%'}} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glowM" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="12" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <mask id="cutM">
        <rect width="200" height="200" fill="white"/>
        <rect x="30" y="82" width="140" height="14" fill="black" rx="1"/>
        <rect x="30" y="116" width="140" height="18" fill="black" rx="1"/>
        <circle cx="15" cy="100" r="18" fill="black"/>
        <circle cx="185" cy="100" r="18" fill="black"/>
      </mask>
    </defs>
    <g filter="url(#glowM)">
      <circle cx="100" cy="100" r="80" fill="white" mask="url(#cutM)"/>
    </g>
    <circle cx="100" cy="100" r="80" fill="white" mask="url(#cutM)" style={{filter:'drop-shadow(0 0 20px rgba(255,255,255,0.8))'}}/>
  </svg>
);

// Lens Blue Camera EXACTLY like your dark image
const LensCameraExact = () => (
  <svg viewBox="0 0 100 70" style={{width:'110px',height:'77px'}} xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="2" width="18" height="7" rx="3.5" fill="#1a73e8"/>
    <path d="M 10 15 Q 10 10 18 10 L 68 10 Q 76 10 80 14 L 85 20 Q 88 24 88 28 L 88 56 Q 88 66 78 66 L 18 66 Q 8 66 8 56 L 8 20 Q 8 15 10 15 Z" fill="none" stroke="#1a73e8" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="48" cy="40" r="16" fill="none" stroke="#1a73e8" strokeWidth="4.5"/>
    <circle cx="76" cy="22" r="3.5" fill="#1a73e8"/>
  </svg>
);

export default function App(){
  const [page,setPage]=useState(0);
  const [dragX,setDragX]=useState(0);
  const [isDragging,setIsDragging]=useState(false);
  const [lensState,setLensState]=useState('permission');
  const [status,setStatus]=useState('idle');
  const [result,setResult]=useState(null);
  const startXRef=useRef(0);
  const videoRef=useRef(null);
  const cameraStreamRef=useRef(null);
  const recRef=useRef(null);
  const streamRef=useRef(null);

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
          if(d.result) setResult(d.result);
          else setResult({title: d.error?.error_message || 'No match', artist:'Try louder'});
        }catch{ setResult({title:'Network error', artist:'Check internet'}); }
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
    }catch(e){ alert('Allow camera!'); }
  };
  const closeCamera=()=>{ if(cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach(t=>t.stop()); setLensState('permission'); };

  const onTouchStart=(e)=>{ startXRef.current=e.touches[0].clientX; setIsDragging(true); };
  const onTouchMove=(e)=>{
    if(!isDragging) return;
    const diff=e.touches[0].clientX-startXRef.current;
    if((page===0 && diff>0) || (page===1 && diff<0)) setDragX(diff*0.35);
    else setDragX(diff);
  };
  const onTouchEnd=()=>{
    setIsDragging(false);
    if(dragX<-60 && page===0) setPage(1);
    else if(dragX>60 && page===1) setPage(0);
    setDragX(0);
  };

  if(status==='found' && result){
    const art=result.spotify?.album?.images?.[0]?.url || result.apple_music?.artwork?.url?.replace('{w}x{h}','600x600') || 'https://via.placeholder.com/600';
    return(<div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'#121212',overflowY:'auto',color:'white',fontFamily:'system-ui'}}><div style={{height:'55vh',position:'relative'}}><img src={art} style={{width:'100%',height:'100%',objectFit:'cover'}}/><button onClick={()=>setStatus('idle')} style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,0.5)',border:'none',borderRadius:20,width:36,height:36,color:'white',fontSize:20}}>←</button></div><div style={{padding:20}}><div style={{fontSize:28,fontWeight:800}}>{result.title}</div><div style={{color:'#aaa',marginTop:6}}>{result.artist}</div><button onClick={()=>setStatus('idle')} style={{width:'100%',background:'#0091EA',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,marginTop:24}}>Find Another</button></div></div>);
  }
  if(status==='searching'){
    return(<div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 50% -10%, #7ED8FF 0%, #2EB6FF 15%, #009CFF 50%, #007AFF 100%)',color:'white',fontFamily:'system-ui'}}><div style={{width:70,height:70,border:'4px solid rgba(255,255,255,0.3)',borderTop:'4px solid white',borderRadius:40,animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style></div>);
  }

  return(
    <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,overflow:'hidden',touchAction:'pan-y'}} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div style={{
        display:'flex',
        width:'200vw',
        height:'100%',
        transform:`translateX(calc(-${page*100}vw + ${dragX}px))`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* MUSIC SECTION - EXACTLY LIKE IMAGE 2 */}
        <div style={{width:'100vw',height:'100%',flexShrink:0,position:'relative',display:'flex',flexDirection:'column',background:'radial-gradient(ellipse at 30% 20%, #4FC3FF 0%, #29B6FF 25%, #0AA6FF 50%, #008CFF 75%, #0078FF 100%)',overflow:'hidden'}}>
          {/* Top bar - Search + Menu EXACTLY like Image 2 */}
          <div style={{height:56,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 20px',position:'relative',zIndex:10}}>
            <div style={{display:'flex',alignItems:'center',gap:8,color:'white'}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3"><circle cx="11" cy="11" r="6.5"/><line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" strokeWidth="2.8"/></svg>
              <span style={{fontSize:18,fontWeight:500,letterSpacing:0.2}}>Search</span>
            </div>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </div>

          {/* Logo Center EXACTLY like Image 2 */}
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:2}}>
            <div onClick={status==='idle'?start:undefined} style={{width:'min(62vw, 300px)',height:'min(62vw, 300px)',cursor:'pointer',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {status==='listening'&&<>
                <div style={{position:'absolute',inset:-10,borderRadius:'50%',background:'rgba(255,255,255,0.22)',animation:'pulse 1.4s infinite'}}/>
                <div style={{position:'absolute',inset:-28,borderRadius:'50%',background:'rgba(255,255,255,0.12)',animation:'pulse 1.4s infinite 0.5s'}}/>
              </>}
              <MusicLogoExact/>
            </div>
          </div>

          {/* Bottom - NO TEXT, tiny dots EXACTLY like Image 2 */}
          <div style={{height:60,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,position:'relative',zIndex:10,paddingBottom:16}}>
            {status==='listening'&&<button onClick={stop} style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.18)',border:'1.2px solid rgba(255,255,255,0.9)',borderRadius:24,padding:'8px 20px',color:'white',fontSize:14,fontWeight:600,backdropFilter:'blur(10px)'}}><div style={{width:12,height:12,background:'white',borderRadius:2}}/> Stop</button>}
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <div style={{width:8,height:8,borderRadius:4,background:'white'}}/>
              <div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.5)'}}/>
              <div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.5)'}}/>
            </div>
          </div>
          <style>{`@keyframes pulse{0%{transform:scale(0.9);opacity:1}100%{transform:scale(1.4);opacity:0}}`}</style>
        </div>

        {/* LENS SECTION - EXACTLY LIKE IMAGE 1 */}
        <div style={{width:'100vw',height:'100%',flexShrink:0,position:'relative',display:'flex',flexDirection:'column',background:'#1a1a1a',overflow:'hidden'}}>
          {lensState==='camera' ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
              <div style={{position:'absolute',top:0,left:0,right:0,height:60,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 16px',zIndex:10,background:'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'}}>
                <button onClick={()=>closeCamera()} style={{background:'none',border:'none',color:'white',fontSize:26,width:40,height:40}}>×</button>
                <div style={{color:'white',fontWeight:600,fontSize:18,letterSpacing:0.8}}>FINDORA</div>
                <div style={{width:40}}/>
              </div>
            </>
          ) : (
            <>
              <div style={{position:'absolute',inset:0,background:'url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800)',backgroundSize:'cover',backgroundPosition:'center',filter:'blur(20px) brightness(0.6)'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)'}}/>
              <div style={{position:'relative',height:'100%',display:'flex',flexDirection:'column',zIndex:2}}>
                {/* Top bar EXACTLY like Image 1 - X, flash-off, FINDORA, clock, menu */}
                <div style={{height:58,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 16px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:22}}>
                    <button onClick={()=>setPage(0)} style={{background:'none',border:'none',color:'white',fontSize:28,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>×</button>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-6z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                      <line x1="2" y1="2" x2="22" y2="22" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{color:'white',fontWeight:700,fontSize:18,letterSpacing:0.9}}>FINDORA</div>
                  <div style={{display:'flex',alignItems:'center',gap:20}}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                  </div>
                </div>

                {/* Middle - Camera Icon + Text EXACTLY like Image 1 */}
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 28px',textAlign:'center'}}>
                  <div style={{marginBottom:32}}><LensCameraExact/></div>
                  <div style={{color:'rgba(255,255,255,0.92)',fontSize:14.5,lineHeight:'1.5',maxWidth:320,marginBottom:10,fontWeight:400}}>FINDORA uses what your camera sees to find<br/>results only while the app is open.</div>
                  <div style={{fontSize:13.5,marginBottom:36,lineHeight:'1.4'}}><span style={{color:'#8ab4f8'}}>Privacy Policy</span><span style={{color:'rgba(255,255,255,0.85)'}}> and </span><span style={{color:'#8ab4f8'}}>Terms of Service</span><span style={{color:'rgba(255,255,255,0.85)'}}> apply.</span></div>
                  <button onClick={openCamera} style={{background:'#c2e7ff',color:'#0b57d0',border:'none',borderRadius:28,height:54,width:'100%',maxWidth:340,display:'flex',alignItems:'center',justifyContent:'flex-start',padding:'0 20px',gap:16,fontSize:16,fontWeight:500,letterSpacing:0.2}}>
                    <div style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" strokeWidth="1.8"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3.5"/></svg>
                    </div>
                    <span style={{flex:1,textAlign:'left',paddingLeft:8}}>Open camera</span>
                  </button>
                </div>

                {/* Bottom - Gallery + Blue Search EXACTLY like Image 1 */}
                <div style={{height:130,display:'flex',justifyContent:'space-between',alignItems:'flex-end',padding:'0 32px 18px',position:'relative'}}>
                  <div style={{width:58,height:58,borderRadius:29,background:'#202124',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,0.08)'}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="white" stroke="none"/><path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <button onClick={openCamera} style={{width:72,height:72,borderRadius:36,background:'#1a73e8',border:'none',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 0 6px rgba(26,115,232,0.18)',position:'absolute',left:'50%',transform:'translateX(-50%)',bottom:28}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.8" y2="16.8" strokeLinecap="round"/></svg>
                  </button>
                  <div style={{width:58,height:58}}/>
                </div>

                {/* Dots tiny EXACTLY like Image 1 */}
                <div style={{height:24,display:'flex',justifyContent:'center',gap:8,paddingBottom:8}}>
                  <div style={{width:6,height:6,borderRadius:3,background:'rgba(255,255,255,0.4)'}}/>
                  <div style={{width:6,height:6,borderRadius:3,background:'white'}}/>
                  <div style={{width:6,height:6,borderRadius:3,background:'rgba(255,255,255,0.4)'}}/>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
      }
