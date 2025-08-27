// src/hooks/usePokerEngine.js
import { useState, useEffect, useCallback, useMemo } from "react";
import Game from "../core/models";
import { AIBot } from "../core/ai";

/**
 * React hook that manages poker game state and actions.
 * @param {Array} initialPlayers - Initial players configuration.
 */
export default function usePokerEngine(initialPlayers) {
  if (!Array.isArray(initialPlayers)) {
    throw new Error("usePokerEngine requires an array of players");
  }
  const [game] = useState(() => new Game(initialPlayers));

  // state game
  const [state, setState] = useState(() => game.start());
  const [availableActions, setAvailableActions] = useState([]);

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
            console.error("Bot action failed", err);
          }
        },
      },
      current.level || "easy"
    );

    const delayMap = { easy: 1200, normal: 2000, hard: 3000 };
    const thinkTime = delayMap[current.level] || 1500;
    const t = setTimeout(() => bot.run(), thinkTime);
    return () => clearTimeout(t);
  }, [state, status, game]);

  // handle player action
  const handleAction = useCallback(
    (action, amount = 0) => {
      try {
        setState((prev) => game.applyAction(prev, action, amount));
      } catch (err) {
        console.error("Invalid player action", err);
      }
    },
    [game]
  );

  // start a new hand
  const startNewHand = useCallback(() => {
    try {
      setState((prev) => game.start(prev));
    } catch (err) {
      console.error("Failed to start new hand", err);
    }
  }, [game]);

  // reset entire game
  const resetGame = useCallback(() => {
    try {
      setState(() => game.start());
    } catch (err) {
      console.error("Failed to reset game", err);
    }
  }, [game]);

  return {
    state,
    pot,
    status,
    winners,
    availableActions,
    handleAction,
    startNewHand,
    resetGame,
  };
}
