import { useCallback } from "react";

const keyboardSounds = [
  "/sounds/keypress1.mp3",
  "/sounds/keypress2.mp3",
  "/sounds/keypress3.mp3",
];

function useKeyboardSound() {
  const playSound = useCallback((src) => {
    const audio = new Audio(src);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  }, []);

  const playRandomKeyStrokeSound = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * keyboardSounds.length);
    playSound(keyboardSounds[randomIndex]);
  }, [playSound]);

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;
