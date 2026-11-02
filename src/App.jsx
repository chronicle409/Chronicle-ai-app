<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  background: #0a90ff;
  margin: 0;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, Arial, sans-serif;
  overflow: hidden;
}
header{
  height: 56px;
  padding: 0 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}
.search{font-size:17px;font-weight:600;display:flex;gap:6px}
.menu{font-size:26px}
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
  width: 300px;
  height: 300px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
  /* GPU glow instead of canvas shadowBlur = NO LAG */
  filter: drop-shadow(0 0 14px rgba(255,255,255,0.85)) drop-shadow(0 0 30px rgba(255,255,255,0.35));
}
canvas {
  width: 100%;
  height: 100%;
}
#status {
  margin-top: 18px;
  font-size: 16px;
  font-weight: 600;
  opacity: .95;
}
#hint {
  font-size: 13px;
  opacity: .7;
  margin-top: 6px;
}
.dots{
  height: 44px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}
.dots span{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.4)}
.dots span.on{background:white;box-shadow:0 0 8px white}
</style>
</head>
<body>

<header>
  <div class="search">⌕ Search</div>
  <div class="menu">☰</div>
</header>

<div class="voice-container">
  <button id="voiceButton" aria-label="Start listening">
    <canvas id="wave"></canvas>
  </button>
  <div id="status">Tap to start listening</div>
  <div id="hint">FINDORA Voice</div>
</div>

<div class="dots"><span class="on"></span><span></span><span></span></div>

<script>
const canvas = document.getElementById("wave");
const ctx = canvas.getContext("2d");
const button = document.getElementById("voiceButton");
const status = document.getElementById("status");

let listening = false;
let audioContext, analyser, microphone, stream, dataArray;
const bars = 160;

function resizeCanvas() {
  const size = 300;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();

async function startListening() {
  try {
    status.textContent = "Listening...";
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    microphone = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.78;
    microphone.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    listening = true;
  } catch {
    status.textContent = "Microphone permission required";
  }
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
  const w = 300, h = 300, cx = w/2, cy = h/2;
  ctx.clearRect(0, 0, w, h);

  if (listening && analyser) analyser.getByteFrequencyData(dataArray);

  const time = performance.now() * 0.001;

  // --- INNER DOTTED RINGS (fast, no shadow) ---
  ctx.fillStyle = "white";
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 72, cy + Math.sin(a) * 72, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 86, cy + Math.sin(a) * 86, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // --- OUTER WHITE WAVE - SMOOTH ---
  ctx.strokeStyle = "white";
  ctx.lineCap = "round";
  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    let sound = 0;
    if (listening && dataArray) {
      const idx = Math.floor((i / bars) * dataArray.length);
      sound = dataArray[idx] / 255;
    }
    // smooth idle + sound
    const idle = Math.sin(angle * 4 + time * 1.8) * 8 + Math.sin(angle * 7 + time * 1.2) * 4;
    const length = listening ? 16 + sound * 34 + idle * 0.6 : 18 + idle;

    const r1 = 96;
    const r2 = r1 + length;
    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;

    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
draw();
</script>
</body>
</html>
