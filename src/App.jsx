import { useState } from 'react';
const AUDD_TOKEN = "c961a8e99fb8b8fd0e59ea9d83d4e2e"; // YOUR TOKEN

export default function Findora() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState("");

  const handleFind = async () => {
    if (!file) return alert("Tap mic to choose a song!");
    setLoading(true);
    setResult(null);
    setSpeed("Trimming to 10s like Shazam...");

    const sliceSize = Math.min(file.size, 1.2 * 1024 * 1024);
    const fastFile = file.slice(0, sliceSize);

    const form = new FormData();
    form.append('file', fastFile, file.name);
    form.append('api_token', AUDD_TOKEN);
    form.append('return', 'apple_music,spotify,timecode');
    form.append('accurate', 'off');

    try {
      const start = Date.now();
      setSpeed("Sending 10s clip...");
      const res = await fetch('https://api.audd.io/', { method: 'POST', body: form });
      const data = await res.json();
      const took = ((Date.now() - start) / 1000).toFixed(1);
      
      if (data.result) {
        setResult(data.result);
        setSpeed(`Found in ${took}s!`);
      } else {
        setResult({ title: "No match - try 10s of chorus", artist: "Wait" });
        setSpeed(`Took ${took}s`);
      }
    } catch (e) {
      setResult({ title: e.message, artist: "Error" });
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh', background:'#FF9A2E', display:'flex', flexDirection:'column', fontFamily:'sans-serif'}}>
      {/* HEADER */}
      <div style={{display:'flex', alignItems:'center', padding:'48px 16px 20px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
          <div style={{width:22,height:3,background:'white',borderRadius:4}}></div>
          <div style={{width:22,height:3,background:'white',borderRadius:4}}></div>
          <div style={{width:22,height:3,background:'white',borderRadius:4}}></div>
        </div>
        <h1 style={{marginLeft:20, color:'white', fontWeight:'bold', fontSize:20, letterSpacing:1}}>FINDORA</h1>
      </div>

      {/* CENTER MIC */}
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <input type="file" accept="audio/*" id="fileInput" hidden onChange={(e)=>setFile(e.target.files[0])} />
        <button onClick={() => file ? handleFind() : document.getElementById('fileInput').click()}
          style={{width:160,height:160,background:'white',borderRadius:'50%',border:'none',fontSize:50,cursor:'pointer', boxShadow:'0 15px 30px rgba(0,0,0,0.15)'}}>
          {loading ? '...' : '🎤'}
        </button>
        <div style={{marginTop:24, color:'white', textAlign:'center'}}>
          <h2 style={{fontSize:24, fontWeight:600}}>{loading ? 'Listening...' : file ? file.name.slice(0,20) : 'Find Song'}</h2>
          <p style={{fontSize:13, opacity:0.85, marginTop:6}}>{speed || "Tap the button and we'll identify your\nsong in seconds"}</p>
        </div>
      </div>

      {/* RESULT */}
      {result && (
        <div style={{background:'white', margin:'16px', borderRadius:'16px', padding:'16px', boxShadow:'0 10px 20px rgba(0,0,0,0.1)'}}>
          <p style={{fontWeight:'bold', color:'#FF9A2E'}}>Result</p>
          <p style={{fontWeight:'bold', marginTop:4}}>{result.title}</p>
          <p style={{color:'#666'}}>{result.artist}</p>
        </div>
      )}

      <div style={{height:40}}></div>
    </div>
  );
}
