// src/hooks/usePokerEngine.js
import { useState, useEffect, useCallback, useMemo } from "react";
import Game, { deepClone } from "../core/models";
import { AIBot } from "../core/ai";

/**
 * React hook that manages poker game state and actions.
 * @param {Array} initialPlayers - Initial players configuration.
 */
export default function usePokerEngine(initialPlayers) {
  if (!Array.isArray(initialPlayers)) {
    throw new Error("usePokerEngine requires an array of players");
  }

  // allow game to be recreated when initialPlayers changes (e.g. custom name/avatar)
  const [game, setGame] = useState(() => new Game(initialPlayers));

  // state game
  const [state, setState] = useState(() => game.start());
  const [availableActions, setAvailableActions] = useState([]);

  // reinitialize game and state when player configuration changes
  useEffect(() => {
    const newGame = new Game(initialPlayers);
    setGame(newGame);
    setState(newGame.start());
  }, [initialPlayers]);

  // derived
  const pot = useMemo(() => game.calculatePot(state), [state, game]);
  const status = useMemo(() => game.checkGameStatus(state), [state, game]);
  const winners = useMemo(() => game.checkWinners(state), [state, game]);

  // update actions saat state berubah
  useEffect(() => {
    setAvailableActions(game.actions(state));
  }, [state, game]);

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
            setState((prev) => game.applyAction(prev, action, amount));
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
  }, [state, status, game]);

  // handle player action
  const handleAction = useCallback(
    (action, amount = 0) => {
      try {
        setState((prev) => game.applyAction(prev, action, amount));
      } catch (err) {
        // Jaga UI tetap responsif ketika aksi pemain tidak valid
        console.error("Invalid player action", err);
      }
    },
    [game],
  );

  // start a new hand
  const startNewHand = useCallback(() => {
    try {
      setState((prev) => game.start(prev));
    } catch (err) {
      // Hindari aplikasi crash saat inisiasi tangan baru
      console.error("Failed to start new hand", err);
    }
  }, [game]);

  // reset entire game
  const resetGame = useCallback(() => {
    try {
      setState(() => game.start());
    } catch (err) {
      // Reset penuh dipantau untuk memudahkan pelacakan state yang bermasalah
      console.error("Failed to reset game", err);
    }
  }, [game]);

  const awardChips = useCallback((playerIndex, amount) => {
    if (!Number.isFinite(amount) || amount === 0) return;
    setState((prev) => {
      if (!prev?.players?.[playerIndex]) return prev;
      const next = deepClone(prev);
      next.players[playerIndex].chips = Math.max(
        0,
        next.players[playerIndex].chips + amount,
      );
      return next;
    });
  }, []);

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
