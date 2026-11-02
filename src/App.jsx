
const button = document.getElementById("findoraListen");
const canvas = document.getElementById("findoraCanvas");
const status = document.getElementById("findoraStatus");
const ctx = canvas.getContext("2d");

const SIZE = 390;
const CENTER = SIZE / 2;
const BAR_COUNT = 180;

let stream = null;
let audioContext = null;
let analyser = null;
let audioData = null;
let listening = false;
let smoothed = new Array(BAR_COUNT).fill(0);

const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = SIZE * dpr;
canvas.height = SIZE * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// START MICROPHONE
async function startListening() {
  try {
    status.textContent = "Connecting microphone...";

    if (!window.isSecureContext) {
      throw new Error("HTTPS is required for microphone access.");
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone API unavailable. Check WebView settings.");
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();

    await audioContext.resume();

    const source = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.75;

    source.connect(analyser);

    audioData = new Uint8Array(analyser.frequencyBinCount);

    listening = true;
    status.textContent = "🎤 Listening... Speak now!";
  } catch (error) {
    console.error("FINDORA microphone error:", error);

    status.textContent = error.name + ": " + error.message;

    stopMicrophone();
    status.textContent = "Microphone error: " + error.message;
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
  smoothed.fill(0);
}

// IMPORTANT: USE CLICK INSTEAD OF POINTERUP
button.addEventListener("click", function(event) {
  event.preventDefault();

  // Immediately confirms that the button was touched
  status.textContent = "Button tapped!";

  if (listening) {
    stopMicrophone();
    status.textContent = "Listening stopped";
  } else {
    startListening();
  }
});

// RAINBOW SOUND ANIMATION
function draw() {
  requestAnimationFrame(draw);

  ctx.clearRect(0, 0, SIZE, SIZE);

  if (listening && analyser) {
    analyser.getByteFrequencyData(audioData);
  }

  const time = performance.now() * 0.001;

  for (let i = 0; i < BAR_COUNT; i++) {
    const angle = i / BAR_COUNT * Math.PI * 2;

    let sound = 0;

    if (listening && audioData) {
      const index = Math.floor(2 + i / BAR_COUNT * 150);
      sound = audioData[index] / 255;
    }

    smoothed[i] += (sound - smoothed[i]) * 0.3;

    const length = listening
      ? 5 + smoothed[i] * 65
      : 5 + Math.sin(time * 1.5 + i * 0.1) * 2;

    const inner = 135;
    const outer = inner + length;

    const x1 = CENTER + Math.cos(angle) * inner;
    const y1 = CENTER + Math.sin(angle) * inner;
    const x2 = CENTER + Math.cos(angle) * outer;
    const y2 = CENTER + Math.sin(angle) * outer;

    const hue = (i * 360 / BAR_COUNT + time * 35) % 360;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.strokeStyle = listening
      ? `hsl(${hue},100%,72%)`
      : "#ffffff";

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.shadowBlur = listening ? 12 : 5;
    ctx.shadowColor = `hsl(${hue},100%,70%)`;
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  [103, 124].forEach(radius => {
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, radius, 0, Math.PI * 2);
    ctx.setLineDash([1, 5]);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });

  ctx.setLineDash([]);
}

draw();
