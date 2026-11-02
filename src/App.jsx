
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FINDORA</title>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: Arial, sans-serif;
  background: #087ff5;
}

body {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

header {
  height: 65px;
  flex-shrink: 0;
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: relative;
  z-index: 2;
}

.search {
  font-size: 25px;
  font-weight: bold;
}

.menu {
  font-size: 34px;
}

.findora-wave-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

#findoraListen {
  display: block;
  width: min(88vw, 390px);
  aspect-ratio: 1;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  z-index: 20;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

#findoraCanvas {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

#findoraStatus {
  margin-top: 12px;
  color: white;
  font-size: 15px;
  font-weight: bold;
  text-align: center;
  min-height: 20px;
  pointer-events: none;
}

.dots {
  height: 48px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 2;
}

.dots span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(255,255,255,.4);
}

.dots span.on {
  background: white;
  box-shadow: 0 0 12px white;
}
</style>
</head>

<body>

<header>
  <div class="search">⌕ Search</div>
  <div class="menu">☰</div>
</header>

<div class="findora-wave-wrap">

  <button id="findoraListen" type="button"
    aria-label="Start listening">

    <canvas id="findoraCanvas"></canvas>

  </button>

  <div id="findoraStatus">
    Tap the circle to listen
  </div>

</div>

<div class="dots">
  <span class="on"></span>
  <span></span>
  <span></span>
</div>

<script>
(() => {

const button = document.getElementById("findoraListen");
const canvas = document.getElementById("findoraCanvas");
const status = document.getElementById("findoraStatus");
const ctx = canvas.getContext("2d");

const SIZE = 390;
const CENTER = SIZE / 2;
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

// START MICROPHONE

async function startListening() {

  try {

    status.textContent = "Opening microphone...";

    if (!window.isSecureContext ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

      throw new Error(
        "Open FINDORA using HTTPS in Chrome."
      );
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    audioContext = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

    await audioContext.resume();

    const source =
      audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.75;

    source.connect(analyser);

    audioData = new Uint8Array(
      analyser.frequencyBinCount
    );

    listening = true;

    status.textContent = "Listening... Speak now 🎤";

    button.setAttribute(
      "aria-label",
      "Stop listening"
    );

  } catch (error) {

    console.error(error);

    stopMicrophone();

    status.textContent =
      "Microphone error: " + error.message;

  }

}

// STOP MICROPHONE

function stopMicrophone() {

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

  status.textContent = "Tap the circle to listen";

  button.setAttribute(
    "aria-label",
    "Start listening"
  );

}

// BUTTON TAP

button.addEventListener("click", async function(event) {

  event.preventDefault();

  if (listening) {

    stopMicrophone();

  } else {

    await startListening();

  }

});

// RAINBOW SOUND WAVE ANIMATION

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

      const index = Math.floor(
        2 + i / COUNT * 150
      );

      sound = audioData[index] / 255;

    }

    smooth[i] += (sound - smooth[i]) * 0.3;

    const movement = listening
      ? smooth[i] * 65
      : Math.sin(time * 1.5 + i * 0.1) * 2;

    const inner = 135;
    const outer = inner + 5 + Math.max(0, movement);

    const x1 = CENTER + Math.cos(angle) * inner;
    const y1 = CENTER + Math.sin(angle) * inner;

    const x2 = CENTER + Math.cos(angle) * outer;
    const y2 = CENTER + Math.sin(angle) * outer;

    const hue =
      (i * 360 / COUNT + time * 40) % 360;

    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.strokeStyle = listening
      ? `hsl(${hue},100%,72%)`
      : "#ffffff";

    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    ctx.shadowBlur = listening ? 14 : 5;
    ctx.shadowColor = `hsl(${hue},100%,70%)`;

    ctx.stroke();

  }

  // INNER DOTTED CIRCLES

  ctx.shadowBlur = 0;

  [103, 124].forEach(radius => {

    ctx.beginPath();

    ctx.arc(
      CENTER,
      CENTER,
      radius,
      0,
      Math.PI * 2
    );

    ctx.setLineDash([1, 5]);

    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2.5;

    ctx.stroke();

  });

  ctx.setLineDash([]);

}

draw();

})();
</script>

</body>
</html>
