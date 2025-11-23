import { useCallback, useRef } from "react";

export default function useTone({
  frequency = 440,
  duration = 0.15,
  type = "sine",
  volume = 0.2,
} = {}) {
  const contextRef = useRef(null);

  return useCallback(() => {
    if (process.env.NODE_ENV === "test") return;
    if (typeof window === "undefined") return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }

    const ctx = contextRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
  }, [frequency, duration, type, volume]);
}
