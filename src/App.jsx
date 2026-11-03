
function playFindoraSound(type = "on") {
  let audio;

  try {
    const AudioClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioClass) return;

    audio = new AudioClass();

    const play = () => {
      if (audio.state === "closed") return;

      const now = audio.currentTime;
      const master = audio.createGain();

      master.gain.setValueAtTime(0.8, now);
      master.connect(audio.destination);

      const notes =
        type === "on"
          ? [
              { frequency: 520, start: 0, duration: 0.30 },
              { frequency: 660, start: 0.10, duration: 0.34 },
              { frequency: 880, start: 0.20, duration: 0.42 }
            ]
          : [
              { frequency: 880, start: 0, duration: 0.30 },
              { frequency: 660, start: 0.12, duration: 0.34 },
              { frequency: 520, start: 0.24, duration: 0.42 }
            ];

      let remaining = notes.length;

      notes.forEach(note => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        const start = now + note.start;
        const end = start + note.duration;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(note.frequency, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.35, start + 0.04);
        gain.gain.setValueAtTime(0.35, end - 0.10);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        oscillator.connect(gain);
        gain.connect(master);

        oscillator.onended = () => {
          remaining--;

          if (remaining === 0 && audio.state !== "closed") {
            audio.close().catch(() => {});
          }
        };

        oscillator.start(start);
        oscillator.stop(end + 0.02);
      });
    };

    if (audio.state === "suspended") {
      audio.resume().then(play).catch(error => {
        console.error("FINDORA sound resume error:", error);
        audio.close().catch(() => {});
      });
    } else {
      play();
    }

  } catch (error) {
    console.error("FINDORA sound error:", error);

    if (audio && audio.state !== "closed") {
      audio.close().catch(() => {});
    }
  }
}
