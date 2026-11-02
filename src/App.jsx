import { useState, useRef } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e";

// FIXED MUSIC LOGO - NO SQUARE ARTIFACT
const MusicLogo = () => (
  <svg viewBox="0 0 200 200" style={{width:'100%',height:'100%'}}>
    <defs><mask id="m"><rect width="200" height="200" fill="white"/>
      <g transform="rotate(-28 100 100)"><rect x="-30" y="82" width="260" height="9" fill="black" rx="4"/><rect x="-30" y="110" width="260" height="9" fill="black" rx="4"/>
      <rect x="55" y="75" width="14" height="18" fill="black" rx="2"/><rect x="90" y="75" width="14" height="18" fill="black" rx="2"/><rect x="130" y="103" width="14" height="18" fill="black" rx="2"/></g>
      <circle cx="20" cy="100" r="22" fill="black"/><circle cx="180" cy="100" r="22" fill="black"/>
    </mask></defs>
    <circle cx="100" cy="100" r="78" fill="white" mask="url(#m)" style={{filter:'drop-shadow(0 0 28px rgba(255,255,255,0.9))'}}/>
  </svg>
);

// YOUR VIDEO ANIMATION - EXACT IN BLUE #2f88ff
const AnimatedCameraLogo = () => (
  <div style={{width:'130px',height:'110px',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
    <svg viewBox="0 0 110 80" style={{width:'130px',height:'100px',overflow:'visible'}}>
      <defs>
        <filter id="depthBlue" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#0b57d0" floodOpacity="0.9"/>
        </filter>
      </defs>
      
      {/* Pulse circle - exactly like video */}
      <circle cx="68" cy="32" r="28" fill="#2f88ff" opacity="0" style={{animation:'pulseRing 2.6s ease-out infinite'}}/>
      
      {/* Top flash bar - animates like video */}
      <g style={{animation:'flashPop 2.6s ease-in-out infinite'}}>
        <rect x="8" y="10" width="18" height="7" rx="3.5" fill="#2f88ff" filter="url(#depthBlue)"/>
        <rect x="8" y="10" width="18" height="7" rx="3.5" fill="none" stroke="#0b57d0" strokeWidth="0.8" opacity="0.6"/>
      </g>
      
      {/* Camera body - 3D extruded like video - BLUE */}
      {/* Dark back layer for 3D depth */}
      <path d="M 10 18 Q 10 12 18 12 L 32 12 Q 36 12 38 8 L 42 2 Q 44 0 48 0 L 62 0 Q 66 0 68 2 L 72 8 Q 74 12 78 12 L 92 12 Q 100 12 100 20 L 100 58 Q 100 68 90 68 L 18 68 Q 8 68 8 58 L 8 26 Q 8 18 10 18 Z"
        fill="none" stroke="#0b57d0" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" style={{transform:'translate(1px,1.5px)'}}/>
      {/* Main bright blue body */}
      <path d="M 10 18 Q 10 12 18 12 L 32 12 Q 36 12 38 8 L 42 2 Q 44 0 48 0 L 62 0 Q 66 0 68 2 L 72 8 Q 74 12 78 12 L 92 12 Q 100 12 100 20 L 100 58 Q 100 68 90 68 L 18 68 Q 8 68 8 58 L 8 26 Q 8 18 10 18 Z"
        fill="white" fillOpacity="0.05" stroke="#2f88ff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#depthBlue)"/>
      
      {/* Lens - BLUE */}
      <g>
        <circle cx="54" cy="38" r="20" fill="none" stroke="#0b57d0" strokeWidth="7" opacity="0.9" style={{transform:'translate(1px,1.5px)'}}/>
        <circle cx="54" cy="38" r="20" fill="none" stroke="#2f88ff" strokeWidth="6" filter="url(#depthBlue)"/>
        <circle cx="54" cy="38" r="14" fill="white" fillOpacity="0.03"/>
      </g>
      
      {/* Small dot like video */}
      <circle cx="86" cy="26" r="3.2" fill="#2f88ff" filter="url(#depthBlue)"/>
    </svg>
    <style>{`
      @keyframes flashPop {
        0%, 100% { transform: translateY(8px) scaleX(0.2); opacity: 0; }
        12% { transform: translateY(0px) scaleX(1); opacity: 1; }
        28% { transform: translateY(0px) scaleX(1); opacity: 1; }
        40% { transform: translateY(-2px) scaleX(0.2); opacity: 0; }
        41% { opacity: 0; }
      }
      @keyframes pulseRing {
        0% { transform: scale(0.3); opacity: 0; }
        18% { opacity: 0; transform: scale(0.3); }
        22% { opacity: 0.22; }
        55% { transform: scale(1.45); opacity: 0; }
        100% { transform: scale(1.45); opacity: 0; }
      }
    `}</style>
  </div>
);

export default function App(){
  const [page,setPage]=useState(0); const [dragX,setDragX]=useState(0); const [isDragging,setIsDragging]=useState(false);
  const [lensState,setLensState]=useState('permission'); const [status,setStatus]=useState('idle'); const [result,setResult]=useState(null);
  const startXRef=useRef(0); const videoRef=useRef(null); const cameraStreamRef=useRef(null); const recRef=useRef(null); const streamRef=useRef(null);
  const start=async()=>{ try{ setStatus('listening'); const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,autoGainControl:false,noiseSuppression:false,sampleRate:44100}}); streamRef.current=s; const rec=new MediaRecorder(s); recRef.current=rec; const ch=[]; rec.ondataavailable=e=>{if(e.data.size>0)ch.push(e.data)}; rec.onstop=async()=>{ const blob=new Blob(ch,{type:'audio/webm'}); const file=new File([blob],`song.webm`); if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop()); setStatus('searching'); const fd=new FormData(); fd.append('file',file); fd.append('api_token',AUDD_TOKEN); fd.append('return','spotify,apple_music'); try{ const r=await fetch('https://api.audd.io/',{method:'POST',body:fd}); const d=await r.json(); if(d.result)setResult(d.result); else setResult({title:'No match',artist:'Try again'});}catch{setResult({title:'Network error',artist:'Check internet'})} setStatus('found'); }; rec.start(); setTimeout(()=>{if(recRef.current?.state==='recording')recRef.current.stop()},6000); }catch{alert('Allow mic'); setStatus('idle')} };
  const stop=()=>{if(recRef.current?.state==='recording')recRef.current.stop(); else{ if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop()); setStatus('idle')}};
  const openCamera=async()=>{ try{ const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); cameraStreamRef.current=s; setLensState('camera'); setTimeout(()=>{if(videoRef.current)videoRef.current.srcObject=s},100);}catch{alert('Allow camera')} };
  const closeCamera=()=>{if(cameraStreamRef.current)cameraStreamRef.current.getTracks().forEach(t=>t.stop()); setLensState('permission')};
  const onTouchStart=(e)=>{startXRef.current=e.touches[0].clientX; setIsDragging(true)}; const onTouchMove=(e)=>{if(!isDragging)return; const d=e.touches[0].clientX-startXRef.current; setDragX(d)}; const onTouchEnd=()=>{setIsDragging(false); if(dragX<-60&&page===0)setPage(1); else if(dragX>60&&page===1)setPage(0); setDragX(0)};

  if(status==='found'&&result){ const art=result.spotify?.album?.images?.[0]?.url||'https://via.placeholder.com/600'; return(<div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'#121212',overflowY:'auto',color:'white',fontFamily:'system-ui'}}><div style={{height:'55vh',position:'relative'}}><img src={art} style={{width:'100%',height:'100%',objectFit:'cover'}}/><button onClick={()=>setStatus('idle')} style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,0.5)',border:'none',borderRadius:20,width:36,height:36,color:'white',fontSize:20}}>←</button></div><div style={{padding:20}}><div style={{fontSize:28,fontWeight:800}}>{result.title}</div><div style={{color:'#aaa',marginTop:6}}>{result.artist}</div><button onClick={()=>setStatus('idle')} style={{width:'100%',background:'#0091EA',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,marginTop:24}}>Find Again</button></div></div>)}

  return(
    <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,overflow:'hidden',fontFamily:'system-ui'}} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div style={{display:'flex',width:'200vw',height:'100%',transform:`translateX(calc(-${page*100}vw + ${dragX}px))`,transition:isDragging?'none':'transform 0.3s cubic-bezier(0.32,0.72,0,1)'}}>
        
        <div style={{width:'100vw',height:'100%',flexShrink:0,position:'relative',display:'flex',flexDirection:'column',background:'radial-gradient(ellipse at 30% 20%, #4FC3FF 0%, #0AA6FF 50%, #0078FF 100%)'}}>
          <div style={{height:56,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 20px'}}><div style={{display:'flex',alignItems:'center',gap:8,color:'white'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3"><circle cx="11" cy="11" r="6.5"/><line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" strokeWidth="2.8"/></svg><span style={{fontSize:18,fontWeight:500}}>Search</span></div><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></div>
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}><div onClick={status==='idle'?start:undefined} style={{width:'min(62vw,300px)',height:'min(62vw,300px)',cursor:'pointer'}}><MusicLogo/></div></div>
          <div style={{height:60,display:'flex',justifyContent:'center',alignItems:'center',gap:10}}><div style={{width:8,height:8,borderRadius:4,background:'white'}}/><div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.5)'}}/><div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.5)'}}/></div>
        </div>

        <div style={{width:'100vw',height:'100%',flexShrink:0,position:'relative',display:'flex',flexDirection:'column',background:'#0a0a0a',overflow:'hidden'}}>
          {lensState==='camera'?(
            <><video ref={videoRef} autoPlay playsInline muted style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/><div style={{position:'absolute',top:0,left:0,right:0,height:60,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 16px',zIndex:10,background:'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'}}><button onClick={closeCamera} style={{background:'none',border:'none',color:'white',fontSize:26,width:40,height:40}}>×</button><div style={{color:'white',fontWeight:600,fontSize:18}}>FINDORA</div><div style={{width:40}}/></div></>
          ):(
            <>
              <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
                <div style={{position:'absolute',inset:'-50%',background:`radial-gradient(ellipse at 20% 20%, #ff3b6e 0%, transparent 45%), radial-gradient(ellipse at 80% 20%, #3b82ff 0%, transparent 45%), radial-gradient(ellipse at 40% 80%, #3bff8a 0%, transparent 45%), radial-gradient(ellipse at 80% 80%, #ff8a3b 0%, transparent 45%), radial-gradient(ellipse at 50% 40%, #8a3bff 0%, transparent 50%)`,filter:'blur(45px)',animation:'smoothFlow 8s ease-in-out infinite alternate'}}/>
                <div style={{position:'absolute',inset:0,background:'rgba(10,10,10,0.48)',backdropFilter:'blur(25px)'}}/>
              </div>
              <div style={{position:'relative',height:'100%',display:'flex',flexDirection:'column',zIndex:2}}>
                <div style={{height:58,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 18px'}}><button onClick={()=>setPage(0)} style={{background:'none',border:'none',color:'white',fontSize:28,width:32,height:32}}>×</button><div style={{color:'white',fontWeight:700,fontSize:18,letterSpacing:0.9}}>FINDORA</div><div style={{display:'flex',gap:18}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/></svg><svg width="26" height="26" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></div></div>
                <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 28px',textAlign:'center'}}>
                  <AnimatedCameraLogo/>
                  <div style={{color:'rgba(255,255,255,0.92)',fontSize:14.5,lineHeight:'1.5',maxWidth:320,marginBottom:10,marginTop:18}}>FINDORA uses what your camera sees to find<br/>results only while the app is open.</div>
                  <div style={{fontSize:13.5,marginBottom:36}}><span style={{color:'#8ab4f8'}}>Privacy Policy</span><span style={{color:'rgba(255,255,255,0.85)'}}> and </span><span style={{color:'#8ab4f8'}}>Terms of Service</span><span style={{color:'rgba(255,255,255,0.85)'}}> apply.</span></div>
                  <button onClick={openCamera} style={{background:'#c2e7ff',color:'#0b57d0',border:'none',borderRadius:28,height:54,width:'100%',maxWidth:340,display:'flex',alignItems:'center',justifyContent:'flex-start',padding:'0 20px',gap:16,fontSize:16,fontWeight:500}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" strokeWidth="1.8"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3.5"/></svg><span style={{flex:1,textAlign:'left',paddingLeft:8}}>Open camera</span></button>
                </div>
                <div style={{height:100,display:'flex',justifyContent:'center',alignItems:'flex-end',paddingBottom:22,position:'relative'}}><div style={{position:'absolute',left:24,bottom:22,width:56,height:56,borderRadius:28,background:'#202124',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="white"/><path d="M21 15l-5-5L5 21"/></svg></div><button onClick={openCamera} style={{width:72,height:72,borderRadius:36,background:'#d3e3fd',border:'4px solid rgba(255,255,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" strokeWidth="2.5"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.8" y2="16.8" strokeLinecap="round"/></svg></button></div>
                <div style={{height:24,display:'flex',justifyContent:'center',gap:8,paddingBottom:8}}><div style={{width:6,height:6,borderRadius:3,background:'rgba(255,255,255,0.4)'}}/><div style={{width:6,height:6,borderRadius:3,background:'white'}}/><div style={{width:6,height:6,borderRadius:3,background:'rgba(255,255,255,0.4)'}}/></div>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes smoothFlow{0%{transform:translate(0%,0%) scale(1) rotate(0deg);filter:blur(45px) hue-rotate(0deg)}20%{transform:translate(4%,-6%) scale(1.1) rotate(3deg);filter:blur(50px) hue-rotate(60deg)}40%{transform:translate(-6%,4%) scale(1.15) rotate(-2deg);filter:blur(55px) hue-rotate(120deg)}60%{transform:translate(6%,6%) scale(1.05) rotate(2deg);filter:blur(48px) hue-rotate(200deg)}80%{transform:translate(-4%,-4%) scale(1.2) rotate(-3deg);filter:blur(52px) hue-rotate(280deg)}100%{transform:translate(0%,0%) scale(1) rotate(0deg);filter:blur(45px) hue-rotate(360deg)}}`}</style>
    </div>
  );
                                                                                                                                                                                        }
