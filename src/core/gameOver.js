// src/core/gameOver.js

/**
 * Tentukan apakah permainan berakhir untuk pemain utama (indeks 0).
 * Chip 0 saat all-in belum berarti kalah, jadi hanya dinilai setelah tangan selesai.
 * @param {string} status - Hasil Game.checkGameStatus.
 * @param {Array} players - Daftar pemain.
 * @returns {{playerOutOfChips: boolean, playerWonGame: boolean}}
 */
export function getGameOverState(status, players = []) {
  const hero = players[0];
  if (status === "playing" || !hero) {
    return { playerOutOfChips: false, playerWonGame: false };
  }
  const botsBusted = players.slice(1).every((p) => p.chips <= 0);
  return {
    playerOutOfChips: hero.chips <= 0,
    playerWonGame: hero.chips > 0 && botsBusted,
  };
}
