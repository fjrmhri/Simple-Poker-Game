// src/App.js
import React, { useCallback, useEffect, useRef } from "react";
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
  const playFx = useSound("/sounds/minecraft_level_up.mp3");
  const playWin = useSound("/sounds/win.mp3");

  const prevCommunity = useRef(state.community.length);
  const prevPot = useRef(pot);

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

  useEffect(() => {
    if (prevCommunity.current < state.community.length && state.community.length > 0) {
      playFx();
    }
    prevCommunity.current = state.community.length;
  }, [state.community.length, playFx]);

  useEffect(() => {
    if (prevPot.current !== pot) {
      playFx();
      prevPot.current = pot;
    }
  }, [pot, playFx]);

  const handleAction = useCallback(
    (action, amount) => {
      if (["bet", "raise", "call"].includes(action)) {
        playFx();
      }
      rawHandleAction(action, amount);
    },
    [rawHandleAction, playFx]
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
      </div>
    </div>
  );
}
