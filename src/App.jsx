// WORKING LOGO - Exactly like your 10:32 image
const MusicLogoExact = () => (
  <svg viewBox="0 0 200 200" style={{width:'100%',height:'100%', display:'block', overflow:'visible'}} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="correctMask">
        <rect width="200" height="200" fill="white"/>
        {/* Side circles - left and right cutout */}
        <circle cx="15" cy="108" r="18" fill="black"/>
        <circle cx="185" cy="92" r="16" fill="black"/>
        {/* Diagonal track rails + ties - exactly like your good image */}
        <g transform="rotate(-32 100 100)">
          {/* Top rail */}
          <rect x="10" y="72" width="180" height="6" fill="black"/>
          {/* Bottom rail */}
          <rect x="10" y="102" width="180" height="9" fill="black"/>
          {/* Ties - the small blocks */}
          <rect x="35" y="60" width="14" height="20" fill="black"/>
          <rect x="85" y="64" width="24" height="16" fill="black"/>
          <rect x="130" y="68" width="18" height="12" fill="black"/>
          <rect x="55" y="104" width="32" height="14" fill="black"/>
          <rect x="110" y="108" width="28" height="12" fill="black"/>
          <rect x="160" y="78" width="6" height="18" fill="black"/>
          <rect x="165" y="108" width="5" height="16" fill="black"/>
        </g>
      </mask>
    </defs>
    {/* No SVG filter - glow with CSS to avoid blue square */}
    <circle cx="100" cy="100" r="78" fill="white" mask="url(#correctMask)" 
      style={{filter: 'drop-shadow(0 0 22px rgba(255,255,255,0.95)) drop-shadow(0 0 45px rgba(255,255,255,0.5))'}} 
    />
  </svg>
);
