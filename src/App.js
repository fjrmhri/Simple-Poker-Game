// src/App.js
import React from "react";
import usePokerEngine from "./hooks/usePokerEngine";
import PokerTable from "./components/PokerTable";
import ActionBar from "./components/ActionBar";

export default function App() {
  const {
    state,
    pot,
    status,
    winners,
    availableActions,
    handleAction,
    startNewHand,
  } = usePokerEngine([
    { name: "You", isBot: false },
    { name: "Lucy", isBot: true },
    { name: "Carl", isBot: true },
  ]);

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
        {status !== "playing" && (
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={startNewHand}>
              New Hand
            </button>
          </div>
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
