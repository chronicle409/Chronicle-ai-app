<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body{background:#087ff5;margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:Arial}
#findoraListen{
  width:300px;height:300px;
  background:rgba(255,255,255,0.15);
  border:3px solid white;
  border-radius:50%;
  font-size:20px;
  color:white;
  cursor:pointer;
}
#findoraCanvas{width:100%;height:100%;display:block;pointer-events:none}
</style>
</head>
<body>

<button id="findoraListen" type="button" onclick="tapNow()">
  <canvas id="findoraCanvas"></canvas>
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none">TAP ME</div>
</button>
<div id="findoraStatus" style="margin-top:20px">Tap the circle</div>

<script>
const canvas = document.getElementById("findoraCanvas");
const ctx = canvas.getContext("2d");
const status = document.getElementById("findoraStatus");
const SIZE=300, CENTER=150, BAR_COUNT=120;
let listening=false, stream, audioContext, analyser, audioData, smoothed=new Array(BAR_COUNT).fill(0);
const dpr=Math.min(window.devicePixelRatio||1,2);
canvas.width=SIZE*dpr; canvas.height=SIZE*dpr;
ctx.setTransform(dpr,0,0,dpr,0,0);

async function tapNow(){
  alert("TAPPED! - button works");
  console.log("TAPPED");
  if(listening){ stopMic(); return; }
  try{
    status.textContent="Requesting mic...";
    stream=await navigator.mediaDevices.getUserMedia({audio:true});
    audioContext=new(window.AudioContext||window.webkitAudioContext)();
    await audioContext.resume();
    const src=audioContext.createMediaStreamSource(stream);
    analyser=audioContext.createAnalyser();
    analyser.fftSize=1024;
    src.connect(analyser);
    audioData=new Uint8Array(analyser.frequencyBinCount);
    listening=true;
    status.textContent="Listening... speak now!";
  }catch(e){
    alert("Mic error: "+e.message+"\nUse HTTPS: https://findora-tau.vercel.app");
    status.textContent="Allow mic in browser settings";
  }
}
function stopMic(){
  listening=false;
  stream?.getTracks().forEach(t=>t.stop());
  audioContext?.close();
  status.textContent="Tap the circle";
}

function draw(){
  requestAnimationFrame(draw);
  ctx.clearRect(0,0,SIZE,SIZE);
  if(listening && analyser) analyser.getByteFrequencyData(audioData);
  const t=performance.now()*0.001;
  for(let i=0;i<BAR_COUNT;i++){
    const a=(i/BAR_COUNT)*Math.PI*2;
    let s=0;
    if(listening && audioData) s=audioData[Math.floor(i/BAR_COUNT*audioData.length)]/255;
    smoothed[i]+=(s-smoothed[i])*0.3;
    const len=listening? 8+smoothed[i]*40 : 6+Math.sin(t*2+i*0.1)*2;
    const r1=90, r2=r1+len;
    const x1=CENTER+Math.cos(a)*r1, y1=CENTER+Math.sin(a)*r1;
    const x2=CENTER+Math.cos(a)*r2, y2=CENTER+Math.sin(a)*r2;
    const hue=(i*360/BAR_COUNT+t*30)%360;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
    ctx.strokeStyle=listening?`hsl(${hue},100%,70%)`:"#fff";
    ctx.lineWidth=3; ctx.lineCap="round"; ctx.stroke();
  }
}
draw();
</script>
</body>
</html>
