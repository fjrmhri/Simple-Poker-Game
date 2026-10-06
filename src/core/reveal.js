// src/core/reveal.js
// Jadwal pengungkapan kartu komunitas di layar. Mesin bisa membuka beberapa
// street sekaligus (mis. all-in sebelum flop); tampilan membukanya bertahap.

export const REVEAL_STEP_MS = 1300;
export const SHOWDOWN_RESULT_DELAY_MS = 1800;
export const FOLD_RESULT_DELAY_MS = 600;

/**
 * Langkah jumlah kartu yang ditampilkan dari `from` ke `to`.
 * Flop dibuka sekaligus (3 kartu), turn dan river satu per satu.
 * @returns {number[]} mis. revealSteps(0, 5) -> [3, 4, 5]
 */
export function revealSteps(from, to) {
  const steps = [];
  let count = from;
  while (count < to) {
    count = count < 3 ? 3 : count + 1;
    steps.push(Math.min(count, to));
  }
  return steps;
}

/** Apakah tangan berakhir dengan showdown (lebih dari satu pemain belum fold). */
export function isShowdown(state) {
  return (
    Boolean(state?.endgame) && state.players.filter((p) => !p.folded).length > 1
  );
}

/**
 * Lama waktu sejak transisi `prev -> next` sampai hasil tangan boleh diumumkan.
 * Langkah pertama tampil seketika; langkah berikutnya berjarak REVEAL_STEP_MS.
 */
export function resultDelayMs(prevCommunityLength, next) {
  const steps = revealSteps(prevCommunityLength, next.community.length);
  const pause = isShowdown(next)
    ? SHOWDOWN_RESULT_DELAY_MS
    : FOLD_RESULT_DELAY_MS;
  return Math.max(0, steps.length - 1) * REVEAL_STEP_MS + pause;
}
