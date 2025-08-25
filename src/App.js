// src/App.js
import React, { useCallback, useEffect } from "react";
import usePokerEngine from "./hooks/usePokerEngine";
import PokerTable from "./components/PokerTable";
import ActionBar from "./components/ActionBar";
import WinnerModal from "./components/WinnerModal";
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
  } = usePokerEngine([
    { name: "You", isBot: false },
    { name: "Lucy", isBot: true, level: "normal" },
    { name: "Carl", isBot: true, level: "hard" },
  ]);

  const playDeal = useSound("/sounds/card.mp3");
  const playAction = useSound("/sounds/action.mp3");
  const playWin = useSound("/sounds/win.mp3");

  useEffect(() => {
    if (state.round === "Preflop" && state.community.length === 0) {
      playDeal();
    }
  }, [state.round, state.community.length, playDeal]);

  useEffect(() => {
    if (status === "showdown") {
      playWin();
    }
  }, [status, playWin]);

  const handleAction = useCallback(
    (action, amount) => {
      playAction();
      rawHandleAction(action, amount);
    },
    [rawHandleAction, playAction]
  );

  return (
    <div style={{ minHeight: "100vh", background: "#1c0f14" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <h1 style={{ color: "white", marginBottom: 8 }}>Pyker (React)</h1>
        <div style={{ color: "#ddd", marginBottom: 8 }}>
          Status: <b>{status}</b>
        </div>

        <PokerTable state={state} pot={pot} winners={winners} />

        {/* Hanya tampilkan action bar kalau giliran kamu dan game belum showdown */}
        {state.currentPlayer === 0 &&
          status === "playing" &&
          !state.players[0].folded && (
            <ActionBar actions={availableActions} onAction={handleAction} />
          )}

        {/* Tombol New Hand saat showdown/ended */}
        {status !== "playing" && winners.length > 0 && (
          <WinnerModal
            winners={winners.map((i) => state.players[i].name)}
            onRestart={startNewHand}
          />
        )}
      </div>

      <style>{`
        .btn {
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          background: #8f1d2c;
          color: white;
          cursor: pointer;
        }
        .btn:hover { filter: brightness(1.1); }
      `}</style>
    </div>
  );
}
