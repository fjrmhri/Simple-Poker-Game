import { useRef } from "react";

export default function useSound(url) {
  const audioRef = useRef(null);

  // Memastikan hanya satu audio yang di-load
  if (!audioRef.current) {
    audioRef.current = new Audio(url);
  }

  return () => {
    if (process.env.NODE_ENV === "test") return;
    try {
      // Cek apakah audio ada dan belum sedang dimainkan
      if (audioRef.current) {
        audioRef.current.play();
      }
    } catch (error) {
      // Mengabaikan kesalahan jika ada
      console.error("Failed to play sound:", error);
    }
  };
}
