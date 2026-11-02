import { useState, useRef } from 'react';

const CameraIconBlue = () => (
  <svg viewBox="0 0 120 80" style={{width:'120px',height:'80px'}} xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="5" width="20" height="8" rx="3" fill="#1a73e8"/>
    <path d="M 10 18 L 10 68 Q 10 78 20 78 L 95 78 Q 105 78 105 68 L 105 22 Q 105 12 95 12 L 70 12 L 62 2 L 38 2 L 30 12 Z" fill="none" stroke="#1a73e8" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx="58" cy="48" r="20" fill="none" stroke="#1a73e8" strokeWidth="6"/>
    <circle cx="88" cy="28" r="5" fill="#1a73e8"/>
  </svg>
);

export default function App(){
  const [lensState,setLensState]=useState('permission'); // permission or camera
  const videoRef=useRef(null);
  const cameraStreamRef=useRef(null);

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

  const captureAndSearch=()=>{
    alert('Image captured! Opening Google Lens... Free, does NOT use music chances!');
    window.open('https://lens.google.com/','_blank');
  };

  if(lensState==='camera'){
    return(
      <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'black',overflow:'hidden',fontFamily:'system-ui'}}>
        <video ref={videoRef} autoPlay playsInline muted style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',top:0,left:0,right:0,height:64,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 16px',zIndex:10,background:'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'}}>
          <div style={{display:'flex',alignItems:'center',gap:24}}>
            <button onClick={closeCamera} style={{background:'none',border:'none',color:'white',fontSize:28,width:40,height:40}}>×</button>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/><line x1="3" y1="3" x2="21" y2="21" strokeWidth="2.5"/></svg>
          </div>
          <div style={{color:'white',fontWeight:700,letterSpacing:0.8,fontSize:18}}>FINDORA</div>
          <div style={{display:'flex',alignItems:'center',gap:20}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </div>
        </div>
        <div style={{position:'absolute',top:'32%',left:'18%',right:'18%',bottom:'32%',pointerEvents:'none'}}>
          <div style={{position:'absolute',top:0,left:0,width:32,height:32,borderTop:'3px solid white',borderLeft:'3px solid white',borderTopLeftRadius:14}}/>
          <div style={{position:'absolute',top:0,right:0,width:32,height:32,borderTop:'3px solid white',borderRight:'3px solid white',borderTopRightRadius:14}}/>
          <div style={{position:'absolute',bottom:0,left:0,width:32,height:32,borderBottom:'3px solid white',borderLeft:'3px solid white',borderBottomLeftRadius:14}}/>
          <div style={{position:'absolute',bottom:0,right:0,width:32,height:32,borderBottom:'3px solid white',borderRight:'3px solid white',borderBottomRightRadius:14}}/>
        </div>
        <div style={{position:'absolute',bottom:160,left:'50%',transform:'translateX(-50%)',background:'white',borderRadius:22,padding:'10px 18px',display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:500}}>◫ select text</div>
        <div style={{position:'absolute',bottom:20,left:0,right:0,padding:'0 32px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{width:64,height:64,borderRadius:32,background:'#202124',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#fbbc04" stroke="none"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <button onClick={captureAndSearch} style={{width:76,height:76,borderRadius:38,background:'#1a73e8',border:'4px solid rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>
          </button>
          <div style={{width:64}}/>
        </div>
        <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',gap:8}}><div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.4)'}}/><div style={{width:12,height:12,borderRadius:6,background:'white'}}/><div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.3)'}}/></div>
      </div>
    );
  }

  return(
    <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'#1a1a1a',overflow:'hidden',fontFamily:'system-ui'}}>
      <div style={{position:'absolute',inset:0,background:'url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800)',backgroundSize:'cover',backgroundPosition:'center',filter:'blur(18px) brightness(0.7)'}}/>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.35)'}}/>
      <div style={{position:'relative',height:'100%',display:'flex',flexDirection:'column',zIndex:2}}>
        <div style={{height:64,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:24}}>
            <button style={{background:'none',border:'none',color:'white',fontSize:28,width:40,height:40}}>×</button>
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
          <button onClick={openCamera} style={{background:'#c2e7ff',color:'#0b57d0',border:'none',borderRadius:28,padding:'0 24px',height:56,width:'100%',maxWidth:340,display:'flex',alignItems:'center',justifyContent:'center',gap:16,fontSize:16,fontWeight:500}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b57d0" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="4"/></svg>Open camera</button>
        </div>
        <div style={{height:120,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 32px'}}>
          <div style={{width:64,height:64,borderRadius:32,background:'#202124',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#fbbc04"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <button onClick={openCamera} style={{width:76,height:76,borderRadius:38,background:'#1a73e8',border:'4px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>
          </button>
          <div style={{width:64}}/>
        </div>
        <div style={{height:30,display:'flex',justifyContent:'center',gap:8,paddingBottom:12}}>
          <div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.4)'}}/>
          <div style={{width:12,height:12,borderRadius:6,background:'white'}}/>
          <div style={{width:8,height:8,borderRadius:4,background:'rgba(255,255,255,0.3)'}}/>
        </div>
      </div>
    </div>
  );
}
