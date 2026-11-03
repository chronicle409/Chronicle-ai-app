
function playFindoraSound(type = "on") {
  const soundFile =
    type === "off"
      ? "/findora-off-clean.mp3"
      : "/findora-on-fixed.mp3";

  const audio = new Audio(soundFile);

  audio.volume = 1;

  audio.play().catch((error) => {
    console.error("FINDORA sound playback error:", error);
  });

  return audio;
}
