
let findoraAudio = null;

function playFindoraSound(type = "on") {
  const soundFile =
    type === "off"
      ? "/findora-off-clean.mp3"
      : "/findora-on-fixed.mp3";

  // Stop any previous Findora sound
  if (findoraAudio) {
    findoraAudio.pause();
    findoraAudio.currentTime = 0;
  }

  // Load the selected sound
  findoraAudio = new Audio(soundFile);
  findoraAudio.volume = 1;
  findoraAudio.preload = "auto";

  findoraAudio.play().catch((error) => {
    console.error("FINDORA sound playback error:", error);
  });

  return findoraAudio;
}
