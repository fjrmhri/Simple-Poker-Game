// src/hooks/useSound.js
import { useRef } from "react";

export default function useSound(url) {
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio(url) : null);
  return () => {
    if (process.env.NODE_ENV === "test") return;
    try {
      audioRef.current && audioRef.current.play();
    } catch {
      // ignore play errors
    }
  };
}
