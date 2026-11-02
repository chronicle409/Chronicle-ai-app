<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Camera Click</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#fff; gap:20px; }
.camera { width:300px; height:270px; overflow:visible; cursor:pointer; }
.camera-body { fill:none; stroke:#2f88ff; stroke-width:20; stroke-linecap:round; stroke-linejoin:round; }
.lens { fill:none; stroke:#2f88ff; stroke-width:20; }
.flash-btn { fill:none; stroke:#2f88ff; stroke-width:18; stroke-linecap:round; }
.flash { fill:#2f88ff; opacity:0; transform-origin: 249px 89px; }
.flash.show { animation: shutter 0.6s ease-out forwards; }
@keyframes shutter {
  0% { opacity:0; transform:scale(0.1); }
  40% { opacity:0.3; transform:scale(0.8); }
  100% { opacity:0; transform:scale(1.8); }
}
.camera-dot { cursor:pointer; }
.camera-dot.anim { animation: shutterClick 0.6s ease-in-out; }
@keyframes shutterClick {
  0% { transform: scale(1); }
  30% { transform: scale(0.88); }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
#display {
  width:300px; height:100px; border-radius:16px; background:#e8f0ff;
  border:2px solid #2f88ff; display:none; align-items:center;
  justify-content:center; color:#2f88ff; font-family:Arial; font-weight:700;
}
#display.show { display:flex; }
</style>
</head>
<body>

<svg class="camera" id="cam" viewBox="0 0 300 270" xmlns="http://www.w3.org/2000/svg">
  <path class="flash-btn" d="M35 12 H72" />
  <path class="camera-body" d="M48 50 H97 L108 19 Q112 8 125 8 H180 Q193 8 197 20 L208 50 H253 Q280 50 280 78 V222 Q280 250 253 250 H48 Q20 250 20 222 V78 Q20 50 48 50 Z" />
  <circle class="lens" cx="150" cy="145" r="64" />
  <circle class="flash" id="flashCircle" cx="249" cy="89" r="85" />
  <circle class="camera-dot" id="dot" cx="249" cy="89" r="14" fill="#2f88ff" />
</svg>

<div id="display">📸 Displayed After Click!</div>

<script>
const cam = document.getElementById('cam');
const dot = document.getElementById('dot');
const flash = document.getElementById('flashCircle');
const display = document.getElementById('display');

cam.addEventListener('click', () => {
  dot.classList.remove('anim');
  flash.classList.remove('show');
  void dot.offsetWidth;
  dot.classList.add('anim');
  flash.classList.add('show');
  display.classList.add('show');
  
  setTimeout(() => {
    dot.classList.remove('anim');
    flash.classList.remove('show');
  }, 600);
});
</script>

</body>
</html>
