import { useState } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e";

// EXACT LOGO FROM YOUR IMAGE - CLEAN SVG
const ExactLogo = ({ listening }) => (
  <svg viewBox="0 0 100 115" width="100%" height="100%" style={{overflow:'visible'}}>
    {/* Antenna dot + stem */}
    <circle cx="50" cy="8" r="8.5" fill="#00F5FF"/>
    <path d="M46 16 L46 26 Q46 30 50 30 Q58 30 62 32 Q68 34 68 42 L68 50" fill="none" stroke="#00F5FF" strokeWidth="7" strokeLinecap="round"/>
    {/* Left arc */}
    <path d="M35 28 A38 38 0 0 0 10 58 A38 38 0 0 0 62 82" fill="none" stroke="#00F5FF" strokeWidth="7.5" strokeLinecap="round"/>
    {/* Right side with handle */}
    <path d="M73 57 A38 38 0 0 1 73 57" fill="none" stroke="#00F5FF" strokeWidth="7.5" strokeLinecap="round"/>
    <path d="M62 82 L72 90" fill="none" stroke="#00F5FF" strokeWidth="7" strokeLinecap="round"/>
    <rect x="72" y="88" width="22" height="13" rx="4.5" fill="#00F5FF" transform="rotate(42 83 94)"/>
    {/* Right gap arc */}
    <path d="M62 32 A38 38 0 0 1 84 56" fill="none" stroke="#00F5FF" strokeWidth="7.5" strokeLinecap="round"/>
    {/* Eyes */}
    <ellipse cx="34" cy="53" rx="7" ry="10.5" fill="white"/>
    <ellipse cx="58" cy="53" rx="7" ry="10.5" fill="white"/>
    {listening && (
      <>
        <circle cx="34" cy="56" r="3" fill="#0091EA"><animate attributeName="cy" values="53;57;53" dur="0.35s" repeatCount="indefinite"/></circle>
        <circle cx="58" cy="56" r="3" fill="#0091EA"><animate attributeName="cy" values="53;57;53" dur="0.35s" repeatCount="indefinite"/></circle>
      </>
    )}
  </svg>
);

export default function App(){
  const [status,setStatus]=useState('idle');
  const [result,setResult]=useState(null);
  const listen=async()=>{
    try{
      setStatus('listening');
      const s=await navigator.mediaDevices.getUserMedia({audio:true});
      const rec=new MediaRecorder(s); const ch=[];
      rec.ondataavailable=e=>ch.push(e.data);
      rec.onstop=async()=>{
        const b=new Blob(ch,{type:'audio/webm'}); const f=new File([b],"a.webm"); s.getTracks().forEach(t=>t.stop());
        const fd=new FormData(); fd.append('file',f); fd.append('api_token',AUDD_TOKEN); fd.append('return','spotify,apple_music');
        try{ const r=await fetch('https://api.audd.io/',{method:'POST',body:fd}); const d=await r.json(); setResult(d.result||{title:"No match",artist:"Try again"}); }catch{ setResult({title:"Error",artist:"Check net"}); }
        setStatus('found');
      };
      rec.start(); setTimeout(()=>rec.state==='recording'&&rec.stop(),7000);
    }catch{ setStatus('idle'); }
  };

  return(
    <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',background:'radial-gradient(ellipse at 50% -10%, #7AD7FF 0%, #2EB6FF 18%, #009CFF 45%, #0088FF 100%)',overflow:'hidden',fontFamily:'system-ui'}}>
      {/* HEADER - ALWAYS VISIBLE */}
      <div style={{height:58,minHeight:58,flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,color:'white'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6"><circle cx="11" cy="11" r="6"/><line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round"/></svg><span style={{fontSize:15,fontWeight:600}}>Search</span></div>
        <div style={{display:'flex',flexDirection:'column',gap:5}}><div style={{width:22,height:2.8,background:'white',borderRadius:2}}/><div style={{width:22,height:2.8,background:'white',borderRadius:2}}/><div style={{width:22,height:2.8,background:'white',borderRadius:2}}/></div>
      </div>

      {/* CENTER - FITS */}
      <div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div onClick={status==='idle'?listen:undefined} style={{width:'min(48vw, 175px)',height:'min(52vw, 200px)',cursor:status==='idle'?'pointer':'default',position:'relative'}}>
          {status==='listening'&&<><div style={{position:'absolute',inset:-10,borderRadius:'50%',background:'rgba(0,245,255,0.22)',animation:'p 1.4s infinite'}}/><div style={{position:'absolute',inset:-30,borderRadius:'50%',background:'rgba(0,245,255,0.12)',animation:'p 1.4s infinite 0.5s'}}/></>}
          <ExactLogo listening={status==='listening'}/>
        </div>
        <div style={{marginTop:24,height:60,textAlign:'center'}}>
          {status==='idle'&&<div style={{color:'white',fontSize:14,opacity:0.9}}> </div>}
          {status==='listening'&&<div style={{color:'white',fontWeight:700}}>Listening...</div>}
          {status==='found'&&<div style={{background:'white',borderRadius:16,padding:'12px 16px',width:'min(84vw,320px)'}}><div style={{fontWeight:800,fontSize:13}}>{result.title}</div><div style={{fontSize:11,color:'#666'}}>{result.artist}</div><button onClick={()=>setStatus('idle')} style={{marginTop:8,width:'100%',background:'#0091EA',color:'white',border:'none',padding:8,borderRadius:8,fontWeight:700}}>Again</button></div>}
        </div>
      </div>

      {/* DOTS - ALWAYS VISIBLE */}
      <div style={{height:52,minHeight:52,flexShrink:0,display:'flex',justifyContent:'center',alignItems:'center',gap:8}}>
        <div style={{width:7,height:7,borderRadius:50,background:status==='idle'?'white':'rgba(255,255,255,0.4)'}}/><div style={{width:7,height:7,borderRadius:50,background:status==='listening'?'white':'rgba(255,255,255,0.4)'}}/><div style={{width:7,height:7,borderRadius:50,background:status==='found'?'white':'rgba(255,255,255,0.4)'}}/>
      </div>
      <style>{`@keyframes p{0%{transform:scale(0.9);opacity:1}100%{transform:scale(1.5);opacity:0}}`}</style>
    </div>
  );
}
