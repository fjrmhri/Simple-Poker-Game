// src/hooks/usePokerEngineEnhanced.js
import { useState, useEffect, useCallback, useMemo } from "react";
import GamePoker from "../core/modelsEnhanced";
import { BotPokerCanggih } from "../core/aiEnhanced";

/**
 * React hook yang mengelola state dan aksi game poker.
 * @param {Array} pemainAwal - Konfigurasi pemain awal.
 */
export default function usePokerEngineEnhanced(pemainAwal) {
  if (!Array.isArray(pemainAwal)) {
    throw new Error("usePokerEngineEnhanced membutuhkan array pemain");
  }

  // recreate game when player config changes so custom name/avatar apply
  const [game, setGame] = useState(() => new GamePoker(pemainAwal));
  const [state, setState] = useState(() => game.mulai());
  const [aksiTersedia, setAksiTersedia] = useState([]);
  const [sedangBerjalan, setSedangBerjalan] = useState(false);

  useEffect(() => {
    const newGame = new GamePoker(pemainAwal);
    setGame(newGame);
    setState(newGame.mulai());
  }, [pemainAwal]);

  // State turunan
  const pot = useMemo(() => game.hitungPot(state), [state, game]);
  const status = useMemo(() => game.cekStatusGame(state), [state, game]);
  const pemenang = useMemo(() => game.cekPemenang(state), [state, game]);

  // Update aksi saat state berubah
  useEffect(() => {
    setAksiTersedia(game.aksiTersedia(state));
  }, [state, game]);

  // Jalankan bot saat giliran bot
  useEffect(() => {
    if (status !== "bermain") return;
    const current = state.pemain[state.pemainSaatIni];
    if (!current?.adalahBot) return;

    const bot = new BotPokerCanggih(
      game,
      state,
      {
        push: ({ action, jumlah }) => {
          try {
            setState((prev) => game.terapkanAksi(prev, action, jumlah));
          } catch (err) {
            console.error("Aksi bot gagal:", err);
          }
        },
      },
      current.tingkatKesulitan || "mudah"
    );

    const waktuBerpikir = bot.dapatkanWaktuBerpikir();
    const t = setTimeout(() => bot.jalankan(), waktuBerpikir);
    return () => clearTimeout(t);
  }, [state, status, game]);

  // Handle aksi pemain
  const handleAksi = useCallback(
    (aksi, jumlah = 0) => {
      try {
        setState((prev) => game.terapkanAksi(prev, aksi, jumlah));
      } catch (err) {
        console.error("Aksi pemain tidak valid:", err);
      }
    },
    [game]
  );

  // Mulai hand baru
  const mulaiHandBaru = useCallback(() => {
    try {
      setSedangBerjalan(true);
      setState((prev) => game.mulai(prev));
    } catch (err) {
      console.error("Gagal memulai hand baru:", err);
    } finally {
      setSedangBerjalan(false);
    }
  }, [game]);

  // Reset game seluruhnya
  const resetGame = useCallback(() => {
    try {
      setSedangBerjalan(true);
      setState(() => game.mulai());
    } catch (err) {
      console.error("Gagal reset game:", err);
    } finally {
      setSedangBerjalan(false);
    }
  }, [game]);

  // Cek apakah pemain utama sudah kehabisan chip
  const pemainUtamaHabisChip = useMemo(() => {
    return state.pemain[0]?.chips <= 0;
  }, [state]);

  // Cek apakah pemain utama menang (semua lawan habis chip)
  const pemainUtamaMenang = useMemo(() => {
    const pemainUtama = state.pemain[0];
    if (!pemainUtama || pemainUtama.chips <= 0) return false;
    
    return state.pemain.slice(1).every(p => p.chips <= 0);
  }, [state]);

  return {
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
  };
}