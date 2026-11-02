// FIXED LOGO - NO BLUE BOX, TRACKS INSIDE CIRCLE ONLY
const MusicLogoExact = () => (
  <svg viewBox="0 0 200 200" style={{width:'100%',height:'100%',overflow:'visible'}} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="findoraMaskFinal">
        <rect width="200" height="200" fill="white"/>
        {/* Side circles - cut out */}
        <circle cx="15" cy="115" r="22" fill="black"/>
        <circle cx="185" cy="85" r="18" fill="black"/>
        {/* DIAGONAL TRACKS - exactly like your image 2 - inside circle only */}
        <g transform="rotate(-26 100 100)">
          {/* Two main rails */}
          <rect x="15" y="82" width="170" height="7" fill="black"/>
          <rect x="15" y="108" width="170" height="10" fill="black"/>
          {/* Small ties */}
          <rect x="35" y="79" width="18" height="13" fill="black"/>
          <rect x="95" y="79" width="22" height="13" fill="black"/>
          <rect x="150" y="79" width="14" height="13" fill="black"/>
          <rect x="55" y="105" width="28" height="16" fill="black"/>
          <rect x="115" y="105" width="26" height="16" fill="black"/>
          <rect x="160" y="105" width="10" height="16" fill="black"/>
        </g>
      </mask>
    </defs>
    {/* White circle with glow using CSS - no SVG filter = no blue box */}
    <circle cx="100" cy="100" r="78" fill="white" mask="url(#findoraMaskFinal)" 
      style={{filter:'drop-shadow(0 0 18px rgba(255,255,255,0.9)) drop-shadow(0 0 35px rgba(255,255,255,0.6))'}}/>
  </svg>
);
