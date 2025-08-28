// src/App.js
import React, { useEffect } from "react";
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
    handleAction,
    startNewHand,
    resetGame,
  } = usePokerEngine([
    { name: "You", isBot: false, avatar: "/assets/others/avatar2.jpg" },
    {
      name: "Lucy",
      isBot: true,
      level: "normal",
      avatar: "/assets/others/avatar1.jpg",
    },
    {
      name: "Carl",
      isBot: true,
      level: "hard",
      avatar: "/assets/others/avatar3.jpg",
    },
  ]);

  // Suara untuk pemenang
  const playWinnerSound = useSound("/sounds/minecraft_level_up.mp3");

  useEffect(() => {
    if (winners.length > 0 && status !== "playing") {
      playWinnerSound();
    }
  }, [winners, status, playWinnerSound]);

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-white mb-2 text-center mx-auto mt-2">PokeReact</h1>

        <div className="flex items-center gap-1.5 text-[12px] text-[#e5e7eb] bg-[rgba(0,0,0,0.3)] px-1.5 py-0.5 border border-black shadow-[0_0_0_2px_#fff,0_0_0_4px_#000] mb-2 ml-2 max-w-max">
          Status: <b>{status}</b>
        </div>

        <PokerTable state={state} pot={pot} winners={winners} />

        <ActionBar
          actions={
            state.currentPlayer === 0 &&
            status === "playing" &&
            !state.players[0].folded
              ? availableActions
              : []
          }
          onAction={handleAction}
        />

        {status !== "playing" && winners.length > 0 && (
          <WinnerModal
            winners={winners.map((i) => state.players[i].name)}
            onRestart={startNewHand}
          />
        )}

        {status !== "playing" && state.players[0].chips <= 0 && (
          <OutOfChipsModal
            onRestart={resetGame}
            onExit={() => (window.location.href = "/")}
          />
        )}
      </div>
    </div>
  );
}
