import { useRef } from "react";

export default function useSound(url) {
  const audioRef = useRef();

  // Pastikan hanya membuat objek Audio sekali
  if (!audioRef.current) {
    audioRef.current = new Audio(url);
  }

  return () => {
    if (process.env.NODE_ENV === "test") return;

    const audio = audioRef.current;
    if (!audio) return;

    // Tangani promise play untuk menghindari "Uncaught (in promise)"
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        /* abaikan kesalahan pemutaran */
      });
    }
  };
}
