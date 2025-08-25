// src/App.js
import React, { useCallback, useEffect, useRef } from "react";
import usePokerEngine from "./hooks/usePokerEngine";
import PokerTable from "./components/PokerTable";
import ActionBar from "./components/ActionBar";
import WinnerModal from "./components/WinnerModal";
import OutOfChipsModal from "./components/OutOfChipsModal";
import useSound from "./hooks/useSound";

export default function App() {
  const {
    state,
    pot,
    status,
    winners,
    availableActions,
    handleAction: rawHandleAction,
    startNewHand,
    resetGame,
  } = usePokerEngine([
    { name: "You", isBot: false },
    { name: "Lucy", isBot: true, level: "normal" },
        { name: "Carl", isBot: true, level: "hard" },
  ]);

  // Menggunakan suara yang sama untuk semua aksi
  const playSound = useSound("/public/sounds/minecraft_level_up.mp3");

  const prevCommunity = useRef(state.community.length);
  const prevPot = useRef(pot);

  // Menggunakan suara saat Preflop
  useEffect(() => {
    if (state.round === "Preflop" && state.community.length === 0) {
      playSound();
    }
  }, [state.round, state.community.length, playSound]);

  // Menggunakan suara saat Showdown
  useEffect(() => {
    if (status === "showdown") {
      playSound();
    }
  }, [status, playSound]);

  // Menggunakan suara saat ada perubahan kartu komunitas
  useEffect(() => {
    if (
      prevCommunity.current < state.community.length &&
      state.community.length > 0
    ) {
      playSound();
    }
    prevCommunity.current = state.community.length;
  }, [state.community.length, playSound]);

  // Menggunakan suara saat pot berubah
  useEffect(() => {
    if (prevPot.current !== pot) {
      playSound();
      prevPot.current = pot;
    }
  }, [pot, playSound]);

  // Menambahkan suara untuk tindakan (bet, raise, call, fold, check)
  const handleAction = useCallback(
    (action, amount) => {
      if (["bet", "raise", "call", "fold", "check"].includes(action)) {
        playSound();
      }
      rawHandleAction(action, amount);
    },
    [rawHandleAction, playSound]
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-white mb-2">Pyker (React)</h1>
        <div className="text-gray-200 mb-2">
          Status: <b>{status}</b>
        </div>

        <PokerTable state={state} pot={pot} winners={winners} />

        {state.currentPlayer === 0 &&
          status === "playing" &&
          !state.players[0].folded && (
            <ActionBar actions={availableActions} onAction={handleAction} />
          )}

        {status !== "playing" && winners.length > 0 && (
          <WinnerModal
            winners={winners.map((i) => state.players[i].name)}
            onRestart={startNewHand}
          />
        )}

        {state.players[0].chips <= 0 && (
          <OutOfChipsModal
            onRestart={resetGame}
            onExit={() => (window.location.href = "/")}
          />
        )}
      </div>
    </div>
  );
}
