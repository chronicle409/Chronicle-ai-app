import { useState, useRef } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e";

export default function App(){
  const [status,setStatus]=useState('idle');
  const [result,setResult]=useState(null);
  const recRef=useRef(null);
  const streamRef=useRef(null);

  const start=async()=>{
    try{
      setStatus('listening');
      const s=await navigator.mediaDevices.getUserMedia({audio:true});
      streamRef.current=s;
      const rec=new MediaRecorder(s);
      recRef.current=rec;
      const ch=[];
      rec.ondataavailable=e=>ch.push(e.data);
      rec.onstop=async()=>{
        const b=new Blob(ch,{type:'audio/webm'});
        const f=new File([b],"a.webm");
        if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
        if(ch.length===0){setStatus('idle');return;}
        const fd=new FormData(); fd.append('file',f); fd.append('api_token',AUDD_TOKEN); fd.append('return','spotify,apple_music');
        try{ const r=await fetch('https://api.audd.io/',{method:'POST',body:fd}); const d=await r.json(); setResult(d.result||{title:"No match",artist:"Try again"}); }catch{ setResult({title:"Error",artist:"Check net"}); }
        setStatus('found');
      };
      rec.start();
      setTimeout(()=>{if(recRef.current?.state==='recording') recRef.current.stop();},10000);
    }catch{setStatus('idle');}
  };

  const stop=()=>{
    if(recRef.current?.state==='recording') recRef.current.stop();
    else { if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop()); setStatus('idle'); }
  };

  return(
    <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',background:'radial-gradient(ellipse at 50% 0%, #6ED6FF 0%, #1CB3FF 18%, #009CFF 50%, #007AFF 100%)',overflow:'hidden',fontFamily:'system-ui'}}>
      
      <div style={{height:58,minHeight:58,flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:7,color:'white'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="6"/><line x1="16" y1="16" x2="21" y2="21" strokeLinecap="round"/></svg><span style={{fontSize:15,fontWeight:600}}>Search</span></div>
        <div style={{width:26,height:20,display:'flex',flexDirection:'column',justifyContent:'space-between'}}><div style={{height:3,background:'white',borderRadius:2}}/><div style={{height:3,background:'white',borderRadius:2}}/><div style={{height:3,background:'white',borderRadius:2}}/></div>
      </div>

      {/* BIGGER AND PERFECTLY CENTERED */}
      <div style={{flex:1,minHeight:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div onClick={status==='idle'?start:undefined} style={{width:'min(78vw, 320px)',height:'min(78vw, 320px)',cursor:status==='idle'?'pointer':'default',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {status==='listening'&&<><div style={{position:'absolute',inset:-10,borderRadius:'50%',background:'rgba(255,255,255,0.22)',animation:'p 1.4s infinite'}}/><div style={{position:'absolute',inset:-30,borderRadius:'50%',background:'rgba(255,255,255,0.12)',animation:'p 1.4s infinite 0.5s'}}/></>}
          <img src="/logo.png" alt="logo" style={{width:'100%',height:'100%',objectFit:'contain',filter:'drop-shadow(0 10px 30px rgba(0,0,0,0.25))'}}/>
        </div>
      </div>

      <div style={{height:90,minHeight:90,flexShrink:0,display:'flex',justifyContent:'center',alignItems:'flex-start'}}>
        {status==='listening'&&(
          <button onClick={stop} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.18)',border:'1.5px solid white',borderRadius:40,padding:'11px 30px',color:'white',fontSize:16,fontWeight:600,backdropFilter:'blur(10px)',cursor:'pointer'}}>
            <div style={{width:16,height:16,background:'white',borderRadius:2}}/>Stop
          </button>
        )}
        {status==='found'&&result&&(
          <div style={{background:'white',borderRadius:16,padding:'12px 16px',width:'min(86vw,340px)',textAlign:'center'}}>
            <div style={{fontWeight:800,fontSize:13}}>{result.title}</div>
            <div style={{fontSize:11,color:'#666'}}>{result.artist}</div>
            <button onClick={()=>setStatus('idle')} style={{marginTop:8,width:'100%',background:'#0091EA',color:'white',border:'none',padding:9,borderRadius:10,fontWeight:700}}>Find Again</button>
          </div>
        )}
      </div>

      <div style={{height:44,minHeight:44,flexShrink:0,display:'flex',justifyContent:'center',alignItems:'center',gap:8}}>
        <div style={{width:7,height:7,borderRadius:50,background:status==='idle'?'white':'rgba(255,255,255,0.4)'}}/>
        <div style={{width:7,height:7,borderRadius:50,background:status==='listening'?'white':'rgba(255,255,255,0.4)'}}/>
        <div style={{width:7,height:7,borderRadius:50,background:status==='found'?'white':'rgba(255,255,255,0.4)'}}/>
      </div>
      <style>{`@keyframes p{0%{transform:scale(0.9);opacity:1}100%{transform:scale(1.5);opacity:0}}`}</style>
    </div>
  );
}
