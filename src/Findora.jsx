import { useState } from 'react'

export default function Findora() {
  const [video, setVideo] = useState(null)
  const [result, setResult] = useState("Upload a video to start")

  const findMusic = async () => {
    if(!video) return alert("Upload video first")
    setResult("🎧 Listening with Findora...")
    // TODO: Add AudD token later
    setTimeout(() => setResult("✅ Found: Example Song - Demo (add token to make real)"), 1000)
  }

  return (
    <div style={{padding:20, background:'#000', color:'#fff', minHeight:'100vh', fontFamily:'Arial'}}>
      <h1>Find<span style={{color:'#00ff88'}}>ora</span></h1>
      <p style={{color:'#888'}}>Find any song inside any video</p>
      <input type="file" accept="video/*" onChange={e=>setVideo(e.target.files[0])} />
      {video && <video src={URL.createObjectURL(video)} controls style={{width:'100%', marginTop:15, borderRadius:10}} />}
      <button onClick={findMusic} style={{marginTop:15, padding:14, background:'#00ff88', color:'#000', border:'none', borderRadius:8, width:'100%', fontWeight:'bold'}}>🔍 Find with Findora</button>
      <div style={{marginTop:20, padding:15, background:'#1a1a1a', borderRadius:10}}>{result}</div>
    </div>
  )
}