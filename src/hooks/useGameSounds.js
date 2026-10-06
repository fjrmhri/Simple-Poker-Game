import { useEffect, useRef } from "react";

/**
 * Putar suara saat kartu komunitas bertambah. Reset saat tangan baru
 * (jumlah kartu turun) agar flop/turn/river di tangan berikutnya tetap berbunyi.
 */
export function useCardFlipSound(communityLength, enabled, play) {
  const prevRef = useRef(communityLength);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = communityLength;
    if (enabled && communityLength > prev) play();
  }, [communityLength, enabled, play]);
}

/**
 * Putar suara sekali saat tangan selesai (status berubah dari "playing").
 */
export function useHandEndSound(status, hasWinners, enabled, play) {
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const wasPlaying = prevStatusRef.current === "playing";
    prevStatusRef.current = status;
    if (enabled && hasWinners && wasPlaying && status !== "playing") play();
  }, [status, hasWinners, enabled, play]);
}
