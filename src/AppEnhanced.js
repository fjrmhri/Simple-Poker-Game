// src/AppEnhanced.js
import React, { useEffect, useState } from "react";
import usePokerEngineEnhanced from "./hooks/usePokerEngineEnhanced";
import PokerTableEnhanced from "./components/PokerTableEnhanced";
import ActionBarEnhanced from "./components/ActionBarEnhanced";
import GameOverModal from "./components/GameOverModal";
import StartScreen from "./components/StartScreen";
import MobileWarning from "./components/MobileWarning";
import useSound from "./hooks/useSound";

export default function AppEnhanced() {
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
    pemenang,
    aksiTersedia,
    handleAksi,
    mulaiHandBaru,
    resetGame,
    sedangBerjalan,
    pemainUtamaHabisChip,
    pemainUtamaMenang,
  } = usePokerEngineEnhanced([
    playerConfig || { nama: "You", adalahBot: false, avatar: "/assets/others/avatar2.jpg" },
    {
      nama: "Lucy",
      adalahBot: true,
      tingkatKesulitan: "normal",
      avatar: "/assets/others/avatar1.jpg",
    },
    {
      nama: "Carl",
      adalahBot: true,
      tingkatKesulitan: "sulit",
      avatar: "/assets/others/avatar3.jpg",
    },
  ]);

  // Suara untuk pemenang
  const mainkanSuaraMenang = useSound("/sounds/minecraft_level_up.mp3");

  useEffect(() => {
    if (pemenang.length > 0 && status !== "bermain") {
      mainkanSuaraMenang();
    }
  }, [pemenang, status, mainkanSuaraMenang]);

  const handleStartGame = (config) => {
    setPlayerConfig(config);
    setGameStarted(true);
  };

  const handleRestart = () => {
    resetGame();
  };

  const handleExit = () => {
    setGameStarted(false);
    setPlayerConfig(null);
  };

  // Tampilkan peringatan mobile jika layar terlalu kecil
  if (isMobile) {
    return <MobileWarning />;
  }

  // Tampilkan start screen jika game belum dimulai
  if (!gameStarted) {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
                Pemain: <span className="text-white font-semibold">{playerConfig?.nama || "You"}</span>
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
        <PokerTableEnhanced 
          state={state} 
          pot={pot} 
          winners={pemenang} 
        />

        <ActionBarEnhanced
          actions={
            state.pemainSaatIni === 0 &&
            status === "bermain" &&
            !state.pemain[0].fold
              ? aksiTersedia
              : []
          }
          onAction={handleAksi}
        />
      </main>

      {/* Winner modal untuk hand completion */}
      {status !== "bermain" && pemenang.length > 0 && !pemainUtamaHabisChip && !pemainUtamaMenang && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-40">
          <div className="bg-[rgba(0,0,0,0.9)] text-[#e5e7eb] rounded-xl p-6 w-96 text-center border border-yellow-600 shadow-[0_0_0_2px_#fff,0_0_0_4px_#000]">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Pemenang Ronde</h2>
            <ul className="mb-4">
              {pemenang.map((winner, idx) => (
                <li key={idx} className="text-lg font-semibold text-green-400">
                  {state.pemain[winner].nama}
                </li>
              ))}
            </ul>
            <button
              onClick={mulaiHandBaru}
              disabled={sedangBerjalan}
              className="px-4 py-2 bg-blue-600 border border-blue-700 text-[#e5e7eb] rounded-lg hover:brightness-110 shadow-[0_0_0_2px_#fff,0_0_0_4px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sedangBerjalan ? "Memproses..." : "Main Lagi"}
            </button>
          </div>
        </div>
      )}

      {/* Game over modal */}
      {(pemainUtamaHabisChip || pemainUtamaMenang) && (
        <GameOverModal
          isWin={pemainUtamaMenang}
          playerChips={state.pemain[0]?.chips || 0}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      )}

      {/* Loading overlay */}
      {sedangBerjalan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
            <span className="text-white">Memproses...</span>
          </div>
        </div>
      )}
    </div>
  );
}