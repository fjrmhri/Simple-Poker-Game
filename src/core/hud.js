// src/core/hud.js

export const CHAT_LIMIT = 10;
export const LEADERBOARD_LIMIT = 5;

/**
 * Tambahkan pesan chat dan simpan hanya `limit` pesan terbaru.
 * @param {Array} prev - Pesan yang sudah ada.
 * @param {Array} messages - Pesan baru.
 * @param {number} [limit] - Jumlah maksimum pesan.
 * @returns {Array} Daftar pesan baru.
 */
export function appendLimited(prev, messages, limit = CHAT_LIMIT) {
  return [...prev, ...messages].slice(-limit);
}

/**
 * Perbarui leaderboard dengan skor terbaik (chip tertinggi) per nama.
 * @param {Array} prev - Entri leaderboard yang ada.
 * @param {{name: string, score: number, avatar: string}} entry - Entri pemain.
 * @param {number} [limit] - Jumlah entri maksimum.
 * @returns {Array} Leaderboard terurut menurun.
 */
export function upsertBestScore(prev, entry, limit = LEADERBOARD_LIMIT) {
  const existing = prev.find((item) => item.name === entry.name);
  const score = Math.max(existing?.score ?? 0, entry.score);
  return [
    ...prev.filter((item) => item.name !== entry.name),
    { ...entry, score },
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
