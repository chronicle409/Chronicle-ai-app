<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  background: #087ff5;
  margin: 0;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  overflow: hidden;
}
header{height:56px;padding:0 18px;display:flex;justify-content:space-between;align-items:center;color:white}
.search{font-size:17px;font-weight:600} .menu{font-size:26px}
.voice-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}
#voiceButton {
  width: 280px;
  height: 280px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
  /* glow moved to CSS = smooth */
  filter: drop-shadow(0 0 12px rgba(255,255,255,0.7));
}
canvas { width: 100%; height: 100%; overflow: visible; }
#status { margin-top: 20px; font-size: 18px; font-weight: 600; }
#hint { font-size: 13px; opacity: .8; margin-top: 8px; }
.dots{height:44px;display:flex;gap:10px;justify-content:center;align-items:center}
.dots span{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.4)}
.dots span.on{background:white;box-shadow:0 0 8px white}
</style>
</head>
<body>

<header><div class="search">⌕ Search</div><div class="menu">☰</div></header>

<div class="voice-container">
  <button id="voiceButton">
    <canvas id="wave"></canvas>
  </button>
  <div id="status">Tap to start listening</div>
  <div id="hint">FINDORA Voice Assistant</div>
</div>

<div class="dots"><span class="on"></span><span></span><span></span></div>

<script>
const canvas = document.getElementById("wave");
const ctx = canvas.getContext("2d");
const button = document.getElementById("voiceButton");
const status = document.getElementById("status");
let listening = false, audioContext, analyser, microphone, stream, dataArray;
const bars = 100;

function resizeCanvas() {
  const size = 280;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();

async function startListening() {
  try {
    status.textContent = "Requesting microphone...";
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    microphone = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.75;
    microphone.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    listening = true;
    status.textContent = "Listening...";
  } catch { status.textContent = "Microphone permission required"; }
}
function stopListening() {
  listening = false;
  stream?.getTracks().forEach(t => t.stop());
  audioContext?.close();
  status.textContent = "Tap to start listening";
}
button.addEventListener("click", () => listening ? stopListening() : startListening());

function draw() {
  requestAnimationFrame(draw);
  const w = 280, h = 280, cx = w/2, cy = h/2;
  ctx.clearRect(0, 0, w, h);
  if (listening && analyser) analyser.getByteFrequencyData(dataArray);
  const time = performance.now() * 0.045;

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const freqIdx = Math.floor((i / bars) * (dataArray?.length || 0));
    let sound = listening && dataArray ? dataArray[freqIdx] / 255 : 0;
    const idleMotion = Math.sin(time * 0.035 + i * 0.3) * 2;
    const length = listening ? 7 + sound * 35 + idleMotion : 5 + Math.sin(time * 0.025 + i * 0.2) * 3;
    const innerRadius = 73, outerRadius = innerRadius + Math.max(3, length);
    const x1 = cx + Math.cos(angle) * innerRadius, y1 = cy + Math.sin(angle) * innerRadius;
    const x2 = cx + Math.cos(angle) * outerRadius, y2 = cy + Math.sin(angle) * outerRadius;
    const hue = (i * 360 / bars + time) % 360;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
    ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.stroke();
  }
  // center
  ctx.beginPath(); ctx.arc(cx, cy, 48, 0, Math.PI * 2); ctx.fillStyle = "#087ff5"; ctx.fill();
  for (let i = 0; i < 3; i++) {
    const x = cx + (i - 1) * 13, y = cy + Math.sin(time * 0.06 + i) * 3;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
  }
}
draw();
</script>
</body>
</html>
