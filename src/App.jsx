
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FINDORA</title>

<style>
*{box-sizing:border-box;margin:0;padding:0}

body{
  background:#087ff5;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  font-family:Arial,sans-serif;
  overflow:hidden;
}

header{
  height:65px;
  padding:0 22px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  color:white;
}

.search{font-size:23px;font-weight:bold}
.menu{font-size:30px}

.findora-wave-wrap{
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}

#findoraListen{
  width:min(85vw,350px);
  aspect-ratio:1;
  border:0;
  background:transparent;
  touch-action:manipulation;
  cursor:pointer;
}

#findoraCanvas{
  width:100%;
  height:100%;
  display:block;
  pointer-events:none;
}

#findoraStatus{
  color:white;
  font-size:15px;
  margin:10px 15px 18px;
  font-weight:bold;
  text-align:center;
  min-height:20px;
}

#micButton{
  width:76px;
  height:76px;
  border-radius:50%;
  border:3px solid white;
  background:#0865d9;
  color:white;
  font-size:30px;
  display:flex;
  justify-content:center;
  align-items:center;
  cursor:pointer;
  touch-action:manipulation;
  box-shadow:0 0 20px rgba(255,255,255,.35);
  -webkit-tap-highlight-color:transparent;
}

#micButton.active{
  background:white;
  color:#087ff5;
}

.dots{
  height:45px;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:12px;
}

.dots span{
  width:8px;
  height:8px;
  border-radius:50%;
  background:rgba(255,255,255,.4);
}

.dots span.on{background:white}
</style>
</head>

<body>

<header>
  <div class="search">⌕ Search</div>
  <div class="menu">☰</div>
</header>

<div class="findora-wave-wrap">

  <button id="findoraListen" type="button" aria-label="Toggle listening">
    <canvas id="findoraCanvas"></canvas>
  </button>

<div id="findoraStatus" style="background:white;color:blue;padding:20px;border-radius:15px;font-size:20px;">
  FINDORA TEST SUCCESSFUL
</div>

  <button id="micButton" type="button" aria-label="Start microphone">
    🎤
  </button>

</div>

<div class="dots">
  <span class="on"></span>
  <span></span>
  <span></span>
</div>

<script>
const canvas = document.getElementById("findoraCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("findoraStatus");
const micButton = document.getElementById("micButton");
const waveButton = document.getElementById("findoraListen");

const SIZE = 390;
const CENTER = 195;
const COUNT = 180;

let listening = false;
let stream = null;
let audioContext = null;
let analyser = null;
let audioData = null;
let smooth = new Array(COUNT).fill(0);

const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = SIZE * dpr;
canvas.height = SIZE * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

async function startListening() {

  statusText.textContent = "Button tapped! Requesting microphone...";

  try {

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Microphone is unavailable. Open FINDORA in Chrome using HTTPS."
      );
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error("Your browser does not support audio processing.");
    }

    audioContext = new AudioContextClass();
    await audioContext.resume();

    const source = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.75;

    source.connect(analyser);

    audioData = new Uint8Array(analyser.frequencyBinCount);

    listening = true;

    statusText.textContent = "Listening... Speak now!";
    micButton.textContent = "⏹";
    micButton.classList.add("active");

  } catch (error) {

    console.error("FINDORA microphone error:", error);

    stopListening(
      "Microphone error: " + error.message
    );
  }
}

function stopListening(message = "Ready to listen") {

  listening = false;

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  analyser = null;
  audioData = null;
  smooth.fill(0);

  statusText.textContent = message;
  micButton.textContent = "🎤";
  micButton.classList.remove("active");
}

function toggleMicrophone() {

  if (listening) {
    stopListening("Microphone stopped.");
  } else {
    startListening();
  }
}

micButton.addEventListener("click", toggleMicrophone);
waveButton.addEventListener("click", toggleMicrophone);

// Show an error if another JavaScript problem occurs.
window.addEventListener("error", function(event) {
  statusText.textContent = "Page error: " + event.message;
});

function draw() {

  requestAnimationFrame(draw);

  ctx.clearRect(0, 0, SIZE, SIZE);

  if (listening && analyser && audioData) {
    analyser.getByteFrequencyData(audioData);
  }

  const time = performance.now() * 0.001;

  for (let i = 0; i < COUNT; i++) {

    const angle = i / COUNT * Math.PI * 2;
    let sound = 0;

    if (listening && audioData) {
      const index = Math.min(
        audioData.length - 1,
        Math.floor(2 + i / COUNT * 150)
      );

      sound = audioData[index] / 255;
    }

    smooth[i] += (sound - smooth[i]) * 0.3;

    const length = listening
      ? 5 + smooth[i] * 65
      : 5 + Math.sin(time * 1.5 + i * 0.1) * 2;

    const inner = 135;
    const outer = inner + length;

    const x1 = CENTER + Math.cos(angle) * inner;
    const y1 = CENTER + Math.sin(angle) * inner;
    const x2 = CENTER + Math.cos(angle) * outer;
    const y2 = CENTER + Math.sin(angle) * outer;

    const hue = (i * 360 / COUNT + time * 40) % 360;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.strokeStyle = listening
      ? `hsl(${hue},100%,72%)`
      : "white";

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.shadowBlur = listening ? 13 : 5;
    ctx.shadowColor = `hsl(${hue},100%,70%)`;
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  [103, 124].forEach(radius => {
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, radius, 0, Math.PI * 2);
    ctx.setLineDash([1, 5]);
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });

  ctx.setLineDash([]);
}

draw();
</script>

</body>
</html>
