
const [isListening, setIsListening] = useState(false);

return (
  <>
    <style>{`
      .findora-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: transform 0.5s ease;
      }

      .findora-center.listening {
        transform: translateY(-65px);
      }

      .findora-logo {
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .findora-logo img {
        width: 75%;
        height: 75%;
        object-fit: contain;
      }

      .findora-audio-lines {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        height: 55px;
        margin-top: 25px;
      }

      .findora-audio-lines span {
        width: 6px;
        height: 18px;
        border-radius: 10px;
        background: #00c8ff;
      }

      .findora-center.listening .findora-audio-lines span {
        animation: findoraBars 0.8s ease-in-out infinite alternate,
                   findoraRainbow 5s linear infinite;
      }

      .findora-audio-lines span:nth-child(2) {
        animation-delay: 0.15s;
      }

      .findora-audio-lines span:nth-child(3) {
        animation-delay: 0.3s;
      }

      .findora-audio-lines span:nth-child(4) {
        animation-delay: 0.45s;
      }

      .findora-audio-lines span:nth-child(5) {
        animation-delay: 0.6s;
      }

      @keyframes findoraBars {
        from { transform: scaleY(0.6); }
        to { transform: scaleY(2.1); }
      }

      @keyframes findoraRainbow {
        0% { background: #00c8ff; }
        25% { background: #a855f7; }
        50% { background: #ff3d81; }
        75% { background: #00e5a8; }
        100% { background: #ffe14a; }
      }

      .findora-listening-text {
        color: white;
        text-align: center;
        margin-top: 12px;
        animation: findoraFade 0.5s ease;
      }

      .findora-listening-text h2 {
        font-size: 25px;
        margin: 0 0 10px;
        font-weight: 700;
      }

      .findora-listening-text p {
        font-size: 16px;
        margin: 0;
      }

      @keyframes findoraFade {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>

    <div className={`findora-center ${isListening ? "listening" : ""}`}>
      <div
        className="findora-logo"
        onClick={() => setIsListening(!isListening)}
      >
        <img src="/findora-logo.png" alt="FINDORA" />
      </div>

      {isListening && (
        <>
          <div className="findora-audio-lines">
            {[1, 2, 3, 4, 5].map((line) => (
              <span key={line} />
            ))}
          </div>

          <div className="findora-listening-text">
            <h2>Listening for music</h2>
            <p>Make sure your device can hear the song clearly</p>
          </div>
        </>
      )}
    </div>
  </>
);
