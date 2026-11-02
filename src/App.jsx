*{box-sizing:border-box}html,body,#root{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial,sans-serif}
.findora-app{width:100%;height:100dvh;overflow:hidden;position:relative;touch-action:pan-y;background:#078eff}
.findora-pages{display:flex;width:200%;height:100%;transition:transform 0.45s ease-in-out}
.findora-page{width:50%;height:100%;flex-shrink:0;position:relative;overflow:hidden}
.home-page{background:radial-gradient(circle at 40% 35%,#49c9ff 0%,transparent 45%),linear-gradient(135deg,#32baff,#0087ff)}
.home-header{position:absolute;top:25px;left:30px;right:30px;display:flex;justify-content:space-between;color:white}
.search-heading{display:flex;align-items:center;gap:12px;font-size:23px;font-weight:600}
.search-heading span:first-child{font-size:43px}
.menu-icon{background:none;border:none;color:white;font-size:36px}
.home-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center}
.visualizer-button{width:min(85vw,340px);aspect-ratio:1;border:none;background:transparent;cursor:pointer;display:grid;place-items:center}
.visualizer-button canvas{width:100%;height:100%}
.visualizer-button.active{animation:recordingPulse 1.5s infinite ease-in-out}
@keyframes recordingPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
.recording-status{color:white;font-size:15px;margin-top:10px;letter-spacing:2px}
.pagination{position:absolute;bottom:35px;left:50%;transform:translateX(-50%);display:flex;gap:17px}
.pagination span{width:14px;height:14px;background:rgba(255,255,255,0.35);border-radius:50%}
.pagination span.selected{background:white;transform:scale(1.15)}
.camera-page{background:radial-gradient(ellipse at 50% 48%,rgba(130,112,80,0.75),transparent 65%),linear-gradient(140deg,#303238,#59544c,#22252c);color:white}
.camera-header{position:absolute;top:25px;left:25px;right:25px;display:flex;justify-content:space-between;align-items:center}
.camera-header h2{font-size:24px;letter-spacing:1px}
.camera-header button{background:transparent;color:white;border:none;font-size:34px}
.camera-center{position:absolute;top:46%;left:50%;transform:translate(-50%,-50%);width:90%;display:flex;flex-direction:column;align-items:center;text-align:center}
.animated-camera{width:min(75vw,310px);animation:cameraFloat 2.5s ease-in-out infinite;filter:drop-shadow(0 0 15px rgba(0,125,255,0.3))}
.animated-camera svg{width:100%;overflow:visible}
@keyframes cameraFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.035)}}
.camera-preview{width:min(75vw,310px);aspect-ratio:1;object-fit:cover;border-radius:25px;border:3px solid #087bff}
.camera-description{max-width:600px;margin-top:65px;font-size:17px;line-height:1.5}
.privacy-text{font-size:16px;margin-top:8px}.privacy-text span{color:#65b8ff}
.open-camera{width:min(90%,500px);min-height:68px;border:none;border-radius:50px;background:#b8d3ff;color:#003bb2;font-size:21px;font-weight:700;margin-top:65px;display:flex;justify-content:center;align-items:center;gap:25px}
.camera-footer{position:absolute;bottom:45px;left:0;right:0;display:flex;justify-content:space-around;align-items:center}
.gallery-button{width:85px;height:85px;border:none;border-radius:50%;background:rgba(0,0,0,0.55);color:white;font-size:40px}
.search-button{width:145px;height:145px;border:10px solid rgba(0,130,255,0.3);border-radius:50%;background:#087bdb;color:white;font-size:65px}
.camera-pagination{bottom:12px}
/* camera button click */
.camera-button{transform-box:fill-box;transform-origin:center}
.camera-button:active{animation:shutterClick 0.6s ease-in-out}
@keyframes shutterClick{0%{transform:scale(1)}30%{transform:scale(0.88)}60%{transform:scale(1.08)}100%{transform:scale(1)}}
