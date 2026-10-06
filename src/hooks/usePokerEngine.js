// src/hooks/usePokerEngine.js
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Game, { deepClone } from "../core/models";
import { AIBot } from "../core/ai";

/**
 * React hook that manages poker game state and actions.
 * @param {Array} initialPlayers - Initial players configuration.
 * @param {{onTransition?: (prev: object|null, next: object) => void}} [options]
 *   onTransition dipanggil setiap state berubah karena aksi, tangan baru, atau
 *   reset (prev = null untuk permainan baru). Dipanggil dari event/timer,
 *   bukan dari efek render.
 */
export default function usePokerEngine(initialPlayers, options = {}) {
  if (!Array.isArray(initialPlayers)) {
    throw new Error("usePokerEngine requires an array of players");
  }

  // allow game to be recreated when initialPlayers changes (e.g. custom name/avatar)
  const [game, setGame] = useState(() => new Game(initialPlayers));
  const [state, setState] = useState(() => game.start());

  // State terbaru untuk callback timer/event agar tidak memakai closure lama
  const stateRef = useRef(state);
  const onTransitionRef = useRef(options.onTransition);
  useEffect(() => {
    onTransitionRef.current = options.onTransition;
  }, [options.onTransition]);

  // Satu pintu untuk semua perubahan state
  const commit = useCallback((next, { fresh = false } = {}) => {
    const prev = stateRef.current;
    if (!next || next === prev) return;
    stateRef.current = next;
    setState(next);
    onTransitionRef.current?.(fresh ? null : prev, next);
  }, []);

  // reinitialize game and state when player configuration changes
  // (dilewati saat mount karena state awal sudah dibuat di atas)
  const playersRef = useRef(initialPlayers);
  useEffect(() => {
    if (playersRef.current === initialPlayers) return;
    playersRef.current = initialPlayers;
    const newGame = new Game(initialPlayers);
    setGame(newGame);
    commit(newGame.start(), { fresh: true });
  }, [initialPlayers, commit]);

  // derived
  const pot = useMemo(() => game.calculatePot(state), [state, game]);
  const status = useMemo(() => game.checkGameStatus(state), [state, game]);
  const winners = useMemo(() => game.checkWinners(state), [state, game]);
  const availableActions = useMemo(() => game.actions(state), [state, game]);

  // bot jalan kalau gilirannya bot
  useEffect(() => {
    if (status !== "playing") return;
    const current = state.players[state.currentPlayer];
    if (!current?.isBot) return;

    const bot = new AIBot(
      game,
      state,
      {
        push: ({ action, amount }) => {
          try {
            // Abaikan keputusan basi bila state sudah berubah selama bot berpikir
            if (stateRef.current !== state) return;
            commit(game.applyAction(state, action, amount));
          } catch (err) {
            // Catat kesalahan agar debugging keputusan bot lebih mudah
            console.error("Bot action failed", err);
          }
        },
      },
      current.level || "easy",
    );

    const delayMap = { easy: 1200, normal: 2000, hard: 3000 };
    const baseDelay = delayMap[current.level] || 1500;
    const jitter = Math.random() * baseDelay;
    const thinkTime = baseDelay + jitter;
    const t = setTimeout(() => bot.run(), thinkTime);
    return () => clearTimeout(t);
  }, [state, status, game, commit]);

  // handle player action
  const handleAction = useCallback(
    (action, amount = 0) => {
      const prev = stateRef.current;
      // Pemain manusia hanya boleh beraksi pada gilirannya sendiri
      const current = prev.players?.[prev.currentPlayer];
      if (!current || current.isBot || prev.endgame) return;
      try {
        commit(game.applyAction(prev, action, amount));
      } catch (err) {
        // Jaga UI tetap responsif ketika aksi pemain tidak valid
        console.error("Invalid player action", err);
      }
    },
    [game, commit],
  );

  // start a new hand
  const startNewHand = useCallback(() => {
    try {
      commit(game.start(stateRef.current));
    } catch (err) {
      // Hindari aplikasi crash saat inisiasi tangan baru
      console.error("Failed to start new hand", err);
    }
  }, [game, commit]);

  // reset entire game
  const resetGame = useCallback(() => {
    try {
      commit(game.start(), { fresh: true });
    } catch (err) {
      // Reset penuh dipantau untuk memudahkan pelacakan state yang bermasalah
      console.error("Failed to reset game", err);
    }
  }, [game, commit]);

  const awardChips = useCallback(
    (playerIndex, amount) => {
      if (!Number.isFinite(amount) || amount === 0) return;
      const prev = stateRef.current;
      if (!prev?.players?.[playerIndex]) return;
      // Chip tidak diubah di tengah tangan agar pot dan status all-in tetap konsisten;
      // bonus diterapkan saat tangan berikutnya dibagikan
      const next = deepClone(prev);
      const target = next.players[playerIndex];
      target.pendingChips = (target.pendingChips ?? 0) + amount;
      commit(next);
    },
    [commit],
  );

  return {
    state,
    pot,
    status,
    winners,
    availableActions,
    handleAction,
    startNewHand,
    resetGame,
    awardChips,
  };
}
