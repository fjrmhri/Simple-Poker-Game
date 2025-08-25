// src/hooks/usePokerEngine.js
import { useState, useEffect, useCallback, useMemo } from "react";
import Game from "../core/models";
import { AIBot } from "../core/ai";

export default function usePokerEngine(initialPlayers) {
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
          setState((prev) => game.applyAction(prev, action, amount));
        },
      },
      current.level || "easy"
    );

    const delayMap = { easy: 1200, normal: 2000, hard: 3000 };
    const thinkTime = delayMap[current.level] || 1500;
    const t = setTimeout(() => bot.run(), thinkTime);
    return () => clearTimeout(t);
  }, [state, status, game]);

  const handleAction = useCallback(
    (action, amount = 0) => {
      setState((prev) => game.applyAction(prev, action, amount));
    },
    [game]
  );

  const startNewHand = useCallback(() => {
    setState((prev) => game.start(prev));
  }, [game]);

  const resetGame = useCallback(() => {
    setState(() => game.start());
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
