<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Camera Animation - FINDORA Blue</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  background:#ffffff;
}
.camera {
  width:300px;
  height:270px;
  overflow:visible;
}
.camera-body {
  fill:none;
  stroke:#2f88ff;
  stroke-width:20;
  stroke-linecap:round;
  stroke-linejoin:round;
}
.lens {
  fill:none;
  stroke:#2f88ff;
  stroke-width:20;
}
.flash-btn {
  fill:none;
  stroke:#2f88ff;
  stroke-width:18;
  stroke-linecap:round;
}
.flash-btn-move {
  fill:none;
  stroke:#2f88ff;
  stroke-width:18;
  stroke-linecap:round;
  opacity:0;
  animation: buttonDown 10s infinite;
}
@keyframes buttonDown {
  0% { opacity:0; transform:translateY(0px); }
  2% { opacity:0; transform:translateY(0px); }
  3% { opacity:0.45; transform:translateY(0px); }
  6% { opacity:0.35; transform:translateY(14px); }
  10% { opacity:0; transform:translateY(20px); }
  100% { opacity:0; transform:translateY(20px); }
}
.flash {
  fill:#2f88ff;
  opacity:0;
  transform-box:fill-box;
  transform-origin:center;
  animation: shutter 10s infinite;
}
@keyframes shutter {
  0%, 17% { opacity:0; transform:scale(0.1); }
  20% { opacity:0.25; transform:scale(0.5); }
  23% { opacity:0.17; transform:scale(1); }
  26% { opacity:0.08; transform:scale(1.5); }
  29%, 100% { opacity:0; transform:scale(1.8); }
}
</style>
</head>
<body>
<svg class="camera" viewBox="0 0 300 270" xmlns="http://www.w3.org/2000/svg">
  <!-- Top flash button - main (static) -->
  <path class="flash-btn" d="M35 12 H72" />
  <!-- Top flash button - moves down exactly like video -->
  <path class="flash-btn-move" d="M35 12 H72" />

  <!-- Camera body -->
  <path class="camera-body" d="M48 50 H97 L108 19 Q112 8 125 8 H180 Q193 8 197 20 L208 50 H253 Q280 50 280 78 V222 Q280 250 253 250 H48 Q20 250 20 222 V78 Q20 50 48 50 Z" />

  <!-- Camera lens -->
  <circle class="lens" cx="150" cy="145" r="64" />

  <!-- Shutter / flash effect -->
  <circle class="flash" cx="249" cy="89" r="85" />

  <!-- Small indicator -->
  <circle cx="249" cy="89" r="10" fill="#2f88ff" />
</svg>
</body>
</html>
