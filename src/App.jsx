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
        try{
          const r=await fetch('https://api.audd.io/',{method:'POST',body:fd});
          const d=await r.json();
          const res=d.result||{title:"No match",artist:"Try again",album:"",spotify:null};
          setResult(res);
        }catch{ setResult({title:"Error",artist:"Check net",album:""}); }
        setStatus('found');
      };
      rec.start();
      setTimeout(()=>{if(recRef.current?.state==='recording') recRef.current.stop();},8000);
    }catch{setStatus('idle');}
  };

  const stop=()=>{
    if(recRef.current?.state==='recording'){ recRef.current.stop(); }
    else { if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop()); setStatus('idle'); }
  };

  // SHAZAM STYLE RESULT
  if(status==='found' && result){
    const albumArt = result.spotify?.album?.images?.[0]?.url || result.spotify?.albumArt || result.apple_music?.artwork?.url?.replace('{w}x{h}','600x600') || "https://via.placeholder.com/600?text=Music";
    const title = result.title || "Unknown";
    const artist = result.artist || "Unknown Artist";
    const album = result.album || "";
    const plays = result.spotify?.popularity ? `${(result.spotify.popularity*10000).toLocaleString()}` : "807,188";
    return(
      <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,background:'#121212',overflowY:'auto',fontFamily:'system-ui',color:'white'}}>
        <div style={{height:'58vh',position:'relative',background:'#1a1a1a'}}>
          <img src={albumArt} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 40%, rgba(18,18,18,0.8) 75%, #121212 100%)'}}/>
          <button onClick={()=>setStatus('idle')} style={{position:'absolute',top:14,left:12,background:'rgba(0,0,0,0.4)',border:'none',borderRadius:20,width:36,height:36,color:'white',fontSize:20}}>←</button>
          <div style={{position:'absolute',top:14,right:14,display:'flex',alignItems:'center',gap:6,background:'rgba(0,0,0,0.4)',padding:'6px 12px',borderRadius:20,fontSize:13,fontWeight:600}}><span>♪</span>LYRICS</div>
          <div style={{position:'absolute',bottom:16,right:16,width:56,height:56,background:'rgba(255,255,255,0.9)',borderRadius:28,display:'flex',alignItems:'center',justifyContent:'center',color:'#121212',fontSize:24}}>▶</div>
        </div>

        <div style={{padding:'20px 18px 30px',marginTop:-10}}>
          <div style={{fontSize:28,fontWeight:800,lineHeight:'32px'}}>{title}</div>
          <div style={{fontSize:16,color:'#bbb',marginTop:6}}>{artist} {album?`• ${album}`:''}</div>
          <div style={{display:'flex',gap:10,marginTop:14,alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#2a2a2a',padding:'6px 12px',borderRadius:20,fontSize:13}}><span>⦿</span>{plays}</div>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#2a2a2a',padding:'6px 12px',borderRadius:20,fontSize:13}}>♪ Audiomack ↗</div>
          </div>

          <button onClick={()=>{if(navigator.share) navigator.share({title:title,text:`${title} - ${artist}`});}} style={{width:'100%',background:'#6A4DFF',color:'white',border:'none',padding:16,borderRadius:14,fontSize:16,fontWeight:700,marginTop:20}}>Share song</button>

          <div style={{fontSize:14,fontWeight:800,letterSpacing:1,marginTop:32,marginBottom:14}}>TOP SONGS</div>
          
          <div style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid #222'}}>
            <img src={albumArt} style={{width:64,height:64,borderRadius:8,objectFit:'cover'}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14}}>{title}</div>
              <div style={{fontSize:12,color:'#999',marginTop:2}}>{artist}</div>
              <div style={{display:'inline-block',marginTop:6,background:'#2a2a2a',padding:'4px 10px',borderRadius:12,fontSize:11}}>Audiomack</div>
            </div>
            <div style={{color:'#555'}}>⋮</div>
          </div>

          <div style={{display:'flex',gap:12,padding:'10px 0'}}>
            <div style={{width:64,height:64,borderRadius:8,background:'#333'}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14}}>NON MI INNAMORERÓ (Brazi...</div>
              <div style={{fontSize:12,color:'#999'}}>Pucho, Gordinho Bolado, Mia & Cr...</div>
            </div>
          </div>

          <button onClick={()=>setStatus('idle')} style={{width:'100%',background:'#0091EA',color:'white',border:'none',padding:14,borderRadius:12,fontWeight:700,marginTop:30}}>Find Another Song</button>
        </div>
      </div>
    );
  }

  // MAIN SCREEN - SHARP LOGO PERFECTLY CENTERED
  return(
    <div style={{height:'100dvh',width:'100vw',position:'fixed',inset:0,display:'flex',flexDirection:'column',background:'radial-gradient(ellipse at 50% -10%, #7ED8FF 0%, #2EB6FF 15%, #009CFF 50%, #007AFF 100%)',overflow:'hidden',fontFamily:'system-ui'}}>
      <div style={{height:56,minHeight:56,flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:7,color:'white'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="6"/><line x1="16" y1="16" x2="21" y2="21" strokeLinecap="round"/></svg><span style={{fontSize:15,fontWeight:600}}>Search</span></div>
        <div style={{width:26,height:20,display:'flex',flexDirection:'column',justifyContent:'space-between'}}><div style={{height:3,background:'white',borderRadius:2}}/><div style={{height:3,background:'white',borderRadius:2}}/><div style={{height:3,background:'white',borderRadius:2}}/></div>
      </div>

      <div style={{flex:1,minHeight:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div onClick={status==='idle'?start:undefined} style={{width:'min(72vw, 300px)',height:'min(72vw, 300px)',cursor:status==='idle'?'pointer':'default',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {status==='listening'&&<><div style={{position:'absolute',inset:-10,borderRadius:'50%',background:'rgba(255,255,255,0.22)',animation:'p 1.4s infinite'}}/><div style={{position:'absolute',inset:-30,borderRadius:'50%',background:'rgba(255,255,255,0.12)',animation:'p 1.4s infinite 0.5s'}}/></>}
          <img src="/logo.png" alt="logo" style={{width:'100%',height:'100%',objectFit:'contain',filter:'drop-shadow(0 0 25px rgba(255,255,255,0.9)) drop-shadow(0 0 50px rgba(255,255,255,0.5))',imageRendering:'-webkit-optimize-contrast'}}/>
        </div>
      </div>

      <div style={{height:90,minHeight:90,flexShrink:0,display:'flex',justifyContent:'center',alignItems:'flex-start'}}>
        {status==='listening'&&(
          <button onClick={stop} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.18)',border:'1.5px solid white',borderRadius:40,padding:'11px 30px',color:'white',fontSize:16,fontWeight:600,backdropFilter:'blur(10px)',cursor:'pointer'}}>
            <div style={{width:16,height:16,background:'white',borderRadius:2}}/>Stop
          </button>
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
