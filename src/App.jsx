<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  background:#087ff5;
  min-height:100vh;
  min-height:100svh;
  display:flex;
  flex-direction:column;
  font-family:system-ui,Arial;
  overflow:hidden;
}
header{height:56px;padding:0 18px;display:flex;justify-content:space-between;align-items:center;color:white}
.search{font-size:17px;font-weight:600} .menu{font-size:26px}

.findora-wave-wrap {
  flex:1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
#findoraListen {
  width: min(85vw, 390px);
  aspect-ratio: 1;
  border: 0;
  outline: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  filter: drop-shadow(0 0 14px rgba(255,255,255,0.7));
}
#findoraCanvas {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events:none;
}
#findoraStatus {
  color: white;
  font-size: 15px;
  margin-top: 12px;
  text-align: center;
  font-weight:600;
}
.dots{height:44px;display:flex;gap:10px;justify-content:center;align-items:center}
.dots span{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.4)}
.dots span.on{background:white;box-shadow:0 0 8px white}
</style>
</head>
<body>

<header><div class="search">⌕ Search</div><div class="menu">☰</div></header>

<div class="findora-wave-wrap">
  <button id="findoraListen" type="button" aria-label="Start listening">
    <canvas id="findoraCanvas"></canvas>
  </button>
  <div id="findoraStatus">Tap the circle to listen</div>
</div>

<div class="dots"><span class="on"></span><span></span><span></span></div>

<script>
(() => {
  const button = document.getElementById("findoraListen");
  const canvas = document.getElementById("findoraCanvas");
  const status = document.getElementById("findoraStatus");
  const ctx = canvas.getContext("2d");
  const SIZE = 390, CENTER = SIZE/2, BAR_COUNT = 180;
  let stream=null, audioContext=null, analyser=null, audioData=null, listening=false;
  let smoothed = new Array(BAR_COUNT).fill(0);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  async function startListening() {
    try {
      status.textContent = "Allow microphone...";
      stream = await navigator.mediaDevices.getUserMedia({ audio:{ echoCancellation:true, noiseSuppression:true, autoGainControl:true }});
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);
      audioData = new Uint8Array(analyser.frequencyBinCount);
      listening = true;
      status.textContent = "Listening... Speak now";
    } catch (err) {
      status.textContent = err.name==="NotAllowedError" ? "Please allow microphone" : "Mic error: "+err.message;
      stopMicrophone();
    }
  }
  function stopMicrophone() {
    listening=false;
    stream?.getTracks().forEach(t=>t.stop());
    audioContext?.close();
    stream=null; audioContext=null; analyser=null; audioData=null;
    smoothed.fill(0);
    status.textContent = "Tap the circle to listen";
  }
  const handleTap=(e)=>{ e.preventDefault(); listening ? stopMicrophone() : startListening(); };
  button.addEventListener("touchstart", handleTap, {passive:false});
  button.addEventListener("click", handleTap);

  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0,0,SIZE,SIZE);
    if(listening && analyser) analyser.getByteFrequencyData(audioData);
    const time = performance.now()*0.001;
    for (let i=0;i<BAR_COUNT;i++){
      const angle=(i/BAR_COUNT)*Math.PI*2;
      let sound=0;
      if(listening && audioData){
        const index=Math.floor(2+(i/BAR_COUNT)*150);
        sound=audioData[index]/255;
      }
      smoothed[i]+=(sound-smoothed[i])*0.35;
      const barLength=listening ? 5+smoothed[i]*65 : 5+Math.sin(time*1.5+i*0.1)*2;
      const inner=135, outer=inner+Math.max(2,barLength);
      const x1=CENTER+Math.cos(angle)*inner, y1=CENTER+Math.sin(angle)*inner;
      const x2=CENTER+Math.cos(angle)*outer, y2=CENTER+Math.sin(angle)*outer;
      const hue=(i*360/BAR_COUNT+time*35)%360;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
      ctx.strokeStyle=listening ? `hsl(${hue}, 100%, 72%)` : "#ffffff";
      ctx.lineWidth=3; ctx.lineCap="round"; ctx.stroke();
    }
    [103,124].forEach(radius=>{
      ctx.beginPath(); ctx.arc(CENTER,CENTER,radius,0,Math.PI*2);
      ctx.setLineDash([1,5]); ctx.strokeStyle="rgba(255,255,255,0.85)"; ctx.lineWidth=2.5; ctx.stroke();
    });
    ctx.setLineDash([]);
  }
  draw();
})();
</script>
</body>
</html>
