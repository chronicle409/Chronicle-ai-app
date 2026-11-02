<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>White Audio Visualizer - Like Image</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#000; height:100vh; display:flex; justify-content:center; align-items:center; overflow:hidden; }
canvas { width:min(90vw,600px); height:min(90vw,600px); }
</style>
</head>
<body>
<canvas id="visualizer"></canvas>
<script>
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
let audioContext, analyser, dataArray, active=false;

function resize(){
  const size=Math.min(window.innerWidth*0.9,600);
  const dpr=window.devicePixelRatio||1;
  canvas.width=size*dpr; canvas.height=size*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resize();
window.addEventListener("resize",resize);

const WHITE="#FFFFFF";

function draw(){
  const size=canvas.width/(window.devicePixelRatio||1);
  const center=size/2;
  const radius=size*0.28;
  ctx.clearRect(0,0,size,size);

  if(active && analyser) analyser.getByteFrequencyData(dataArray);

  // Outer dotted ring - like image (small dots)
  for(let i=0;i<200;i++){
    const angle=(i/200)*Math.PI*2;
    const x=center+Math.cos(angle)*radius;
    const y=center+Math.sin(angle)*radius;
    ctx.beginPath();
    ctx.arc(x,y,1.2,0,Math.PI*2);
    ctx.fillStyle=WHITE;
    ctx.globalAlpha=0.9;
    ctx.fill();
  }

  // Inner dotted ring - tighter
  for(let i=0;i<160;i++){
    const angle=(i/160)*Math.PI*2;
    const x=center+Math.cos(angle)*(radius-18);
    const y=center+Math.sin(angle)*(radius-18);
    ctx.beginPath();
    ctx.arc(x,y,1,0,Math.PI*2);
    ctx.fillStyle=WHITE;
    ctx.globalAlpha=0.7;
    ctx.fill();
  }
  ctx.globalAlpha=1;

  // Radial bars - sparse like image, only show when loud
  const bars=180;
  for(let i=0;i<bars;i++){
    const angle=(i/bars)*Math.PI*2;
    let freq=0;
    if(active && dataArray){
      const idx=Math.floor(i/bars*dataArray.length);
      freq=dataArray[idx]/255;
    }else{
      // idle small animation like image
      freq=Math.random()*0.15;
      if(i%25!==0 && i%33!==0) freq*=0.1; // make sparse like screenshot
    }

    if(freq < 0.08) continue; // hide quiet bars = sparse look

    const barLength=freq*90;
    const gap=6;
    const x1=center+Math.cos(angle)*(radius+gap);
    const y1=center+Math.sin(angle)*(radius+gap);
    const x2=center+Math.cos(angle)*(radius+gap+barLength);
    const y2=center+Math.sin(angle)*(radius+gap+barLength);

    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.strokeStyle=WHITE;
    ctx.lineWidth=2.8;
    ctx.lineCap="round";
    ctx.stroke();
  }

  requestAnimationFrame(draw);
}
draw();

async function start(){
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    audioContext=new(window.AudioContext||window.webkitAudioContext)();
    analyser=audioContext.createAnalyser();
    analyser.fftSize=512;
    const source=audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    dataArray=new Uint8Array(analyser.frequencyBinCount);
    active=true;
  }catch(e){ alert("Allow mic"); }
}
document.body.addEventListener("click", start, {once:true});
</script>
</body>
</html>
