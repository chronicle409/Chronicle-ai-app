import { useState } from 'react';
const AUDD_TOKEN = "c961a8e99fb0b8fd0e59ea4dd83d4e2e"; // KEEP YOUR TOKEN

export default function Findora() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState("");

  const handleFind = async () => {
    if (!file) return alert("Choose file!");
    setLoading(true);
    setResult(null);
    setSpeed("⚡ Trimming to 10s like Shazam...");

    // SHAZAM TRICK: Only send first 10 seconds, not whole file
    // This makes it 5x faster
    const sliceSize = Math.min(file.size, 1.2 * 1024 * 1024); // ~10 sec = 1.2MB
    const fastFile = file.slice(0, sliceSize);

    const form = new FormData();
    form.append('file', fastFile, file.name);
    form.append('api_token', AUDD_TOKEN);
    form.append('return', 'apple_music,spotify,timecode');
    form.append('accurate', 'off'); // OFF = fast mode, ON = slow but accurate

    try {
      const start = Date.now();
      setSpeed("🚀 Sending 10s clip...");
      const res = await fetch('https://api.audd.io/', { method: 'POST', body: form });
      const data = await res.json();
      const took = ((Date.now() - start)/1000).toFixed(1);
      setSpeed(`⚡ Found in ${took}s - Shazam speed!`);

      if (data.result) setResult(data.result);
      else setResult({ title: "No match - try 10s of chorus", artist: "AudD" });
    } catch (e) {
      setResult({ title: e.message, artist: "Error" });
    }
    setLoading(false);
  };

  return (
    <div style={{ background: 'black', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '60px', color: '#a3ff12', margin: 0 }}>Findora</h1>
      <p>Shazam-speed search</p>
      
      <input type="file" accept="video/*,audio/*" onChange={e=>setFile(e.target.files[0])} style={{ margin: '20px' }} />
      
      <button onClick={handleFind} style={{ background: '#a3ff12', color: 'black', padding: '14px 40px', borderRadius: '12px', fontWeight: 'bold', border: 'none', fontSize: '18px', width: '100%', maxWidth: '400px' }}>
        {loading ? "⚡ Fast Listening..." : "🔍 Find - Shazam Fast"}
      </button>

      {speed && <p style={{ color: '#a3ff12', marginTop: '10px', fontSize: '14px' }}>{speed}</p>}

      {result && (
        <div style={{ marginTop: '20px', background: '#1a1a1a', padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
          <div style={{ fontWeight: 'bold' }}>{result.title}</div>
          <div style={{ color: '#a3ff12' }}>{result.artist}</div>
          {result.spotify?.external_urls?.spotify && (
            <a href={result.spotify.external_urls.spotify} target="_blank" style={{ background: '#1DB954', color: 'white', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', display: 'inline-block', marginTop: '10px' }}>Spotify</a>
          )}
        </div>
      )}
    </div>
  );
}