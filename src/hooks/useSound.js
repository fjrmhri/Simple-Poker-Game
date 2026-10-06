import { useCallback, useRef } from "react";

export default function useSound(url) {
  const audioRef = useRef(null);

  // Fungsi stabil agar efek yang memakainya tidak terpicu ulang setiap render
  return useCallback(() => {
    if (import.meta.env.MODE === "test") return;

    // Buat objek Audio sekali, saat pertama kali diputar
    if (audioRef.current == null) {
      audioRef.current = new Audio(url);
    }

    // Tangani promise play untuk menghindari "Uncaught (in promise)"
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        /* abaikan kesalahan pemutaran */
      });
    }
  }, [url]);
}
