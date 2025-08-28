// src/AppDebug.js
import React, { useEffect, useState } from "react";
import usePokerEngine from "./hooks/usePokerEngine";
import PokerTableCompatible from "./components/PokerTableCompatible";
import ActionBarCompatible from "./components/ActionBarCompatible";
import GameOverModal from "./components/GameOverModal";
import StartScreen from "./components/StartScreen";
import MobileWarning from "./components/MobileWarning";
import useSound from "./hooks/useSound";

export default function AppDebug() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerConfig, setPlayerConfig] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Cek ukuran layar
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768 || window.innerHeight < 600);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const {
    state,
    pot,
    status,
    winners,
    availableActions,
    handleAction,
    startNewHand,
    resetGame,
    } = usePokerEngine(
      React.useMemo(
        () => [
          playerConfig || { name: "You", isBot: false, avatar: "/assets/others/avatar2.jpg" },
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
        ],
        [playerConfig]
      )
    );

  // Suara untuk pemenang
  const playWinnerSound = useSound("/sounds/minecraft_level_up.mp3");

  useEffect(() => {
    if (winners.length > 0 && status !== "playing") {
      playWinnerSound();
    }
  }, [winners, status, playWinnerSound]);

  const handleStartGame = (config) => {
    // Convert config untuk compatibility dengan model lama
    setPlayerConfig({
      name: config.nama,
      isBot: false,
      avatar: config.avatar,
    });
    setGameStarted(true);
  };

  const handleRestart = () => {
    resetGame();
  };

  const handleExit = () => {
    setGameStarted(false);
    setPlayerConfig(null);
  };

  // Cek apakah pemain utama sudah kehabisan chip
  const playerOutOfChips = state.players[0]?.chips <= 0;

  // Cek apakah pemain utama menang
  const playerWon = state.players[0]?.chips > 0 && 
    state.players.slice(1).every(p => p.chips <= 0);

  // Tampilkan peringatan mobile jika layar terlalu kecil
  if (isMobile) {
    return <MobileWarning />;
  }

  // Tampilkan start screen jika game belum dimulai
  if (!gameStarted) {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-yellow-400">PokeReact</h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-black/30 px-2 py-1 rounded border border-gray-600">
                Status: <b className="text-yellow-400">{status}</b>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Pemain: <span className="text-white font-semibold">{playerConfig?.name || "You"}</span>
              </div>
              <button
                onClick={handleExit}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main game area */}
      <main className="flex-1">
        <PokerTableCompatible
          state={state} 
          pot={pot} 
          winners={winners} 
        />

        <ActionBarCompatible
          actions={
            state.currentPlayer === 0 &&
            status === "playing" &&
            !state.players[0].folded
              ? availableActions
              : []
          }
          onAction={handleAction}
        />
      </main>

      {/* Winner modal untuk hand completion */}
      {status !== "playing" && winners.length > 0 && !playerOutOfChips && !playerWon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-40">
          <div className="bg-[rgba(0,0,0,0.9)] text-[#e5e7eb] rounded-xl p-6 w-96 text-center border border-yellow-600 shadow-[0_0_0_2px_#fff,0_0_0_4px_#000]">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Pemenang Ronde</h2>
            <ul className="mb-4">
              {winners.map((winner, idx) => (
                <li key={idx} className="text-lg font-semibold text-green-400">
                  {state.players[winner].name}
                </li>
              ))}
            </ul>
            <button
              onClick={startNewHand}
              className="px-4 py-2 bg-blue-600 border border-blue-700 text-[#e5e7eb] rounded-lg hover:brightness-110 shadow-[0_0_0_2px_#fff,0_0_0_4px_#000]"
            >
              Main Lagi
            </button>
          </div>
        </div>
      )}

      {/* Game over modal */}
      {(playerOutOfChips || playerWon) && (
        <GameOverModal
          isWin={playerWon}
          playerChips={state.players[0]?.chips || 0}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      )}
    </div>
  );
}