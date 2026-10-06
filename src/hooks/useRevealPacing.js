import { useEffect, useRef, useState } from "react";
import {
  FOLD_RESULT_DELAY_MS,
  REVEAL_STEP_MS,
  SHOWDOWN_RESULT_DELAY_MS,
  isShowdown,
} from "../core/reveal";

/**
 * Atur tempo tampilan: berapa kartu komunitas yang sudah terlihat dan kapan
 * hasil tangan (pemenang, modal, suara) boleh ditampilkan.
 * @param {object} state - State mesin poker.
 * @returns {{visibleCount: number, resultReady: boolean}}
 */
export default function useRevealPacing(state) {
  const handKey = `${state.gameId ?? 0}-${state.handNumber ?? 0}`;
  const target = state.community?.length ?? 0;
  const endgame = Boolean(state.endgame);
  const showdown = isShowdown(state);

  const [shown, setShown] = useState({ hand: handKey, count: target });
  const [readyHand, setReadyHand] = useState(endgame ? handKey : null);
  const lastTargetRef = useRef(target);

  // Tangan baru dimulai dari nol kartu terlihat
  const visibleCount =
    shown.hand === handKey ? Math.min(shown.count, target) : 0;

  useEffect(() => {
    if (visibleCount < target) {
      // Langkah pertama setelah kartu baru dibagikan tampil seketika
      const firstStep = lastTargetRef.current !== target;
      lastTargetRef.current = target;
      const next = visibleCount < 3 ? Math.min(3, target) : visibleCount + 1;
      const timer = setTimeout(
        () => setShown({ hand: handKey, count: next }),
        firstStep ? 0 : REVEAL_STEP_MS,
      );
      return () => clearTimeout(timer);
    }
    lastTargetRef.current = target;
    if (endgame && readyHand !== handKey) {
      const timer = setTimeout(
        () => setReadyHand(handKey),
        showdown ? SHOWDOWN_RESULT_DELAY_MS : FOLD_RESULT_DELAY_MS,
      );
      return () => clearTimeout(timer);
    }
  }, [visibleCount, target, endgame, showdown, handKey, readyHand]);

  return { visibleCount, resultReady: endgame && readyHand === handKey };
}
