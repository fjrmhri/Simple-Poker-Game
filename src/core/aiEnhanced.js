// src/core/aiEnhanced.js
import { getWinners as dapatkanPemenang } from "./handEvaluator";

/**
 * Acak array kartu menggunakan algoritma Fisher-Yates.
 * @param {Array} arr - Array yang akan diacak.
 */
function acakArray(arr) {
  if (!Array.isArray(arr)) {
    throw new Error("acakArray membutuhkan array");
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Hitung pot odds untuk sebuah taruhan.
 * @param {number} ukuranPot - Ukuran pot saat ini.
 * @param {number} jumlahCall - Jumlah yang dibutuhkan untuk call.
 * @returns {number} Nilai pot odds.
 */
function hitungPotOdds(ukuranPot, jumlahCall) {
  if (ukuranPot < 0 || jumlahCall < 0) {
    throw new Error("Ukuran pot dan jumlah call harus non-negatif");
  }
  return jumlahCall / (ukuranPot + jumlahCall);
}

/**
 * Tentukan ukuran taruhan berdasarkan win rate dan ukuran pot.
 * @param {object} aksiTaruhan - Aksi bet/raise dari game.
 * @param {number} ukuranPot - Ukuran pot saat ini.
 * @param {number} winRate - Probabilitas kemenangan (0-1).
 * @param {number} agresivitas - Tingkat agresivitas bot (0-1).
 * @returns {number} Jumlah taruhan yang dihitung.
 */
function pilihJumlahTaruhan(aksiTaruhan, ukuranPot, winRate, agresivitas = 0.5) {
  if (!aksiTaruhan) return 0;
  
  // Strategi taruhan berdasarkan win rate dan agresivitas
  const baseBet = ukuranPot * (0.5 + winRate * agresivitas);
  const minBet = aksiTaruhan.min || 10;
  const maxBet = aksiTaruhan.max || 9999;
  
  // Adjust berdasarkan posisi dan win rate
  let finalBet = baseBet;
  
  if (winRate > 0.7) {
    // Tangan sangat kuat, taruhan besar
    finalBet = ukuranPot * (0.75 + agresivitas * 0.25);
  } else if (winRate > 0.5) {
    // Tangan cukup kuat, taruhan sedang
    finalBet = ukuranPot * (0.5 + agresivitas * 0.3);
  } else if (winRate > 0.3) {
    // Tangan marginal, taruhan kecil atau check
    finalBet = ukuranPot * (0.25 + agresivitas * 0.2);
  } else {
    // Tangan lemah, minimal bet atau check
    finalBet = minBet;
  }
  
  const clamped = Math.max(minBet, Math.min(maxBet, Math.floor(finalBet)));
  return clamped;
}

/**
 * Estimasi win rate menggunakan Monte Carlo simulation.
 * @param {object} state - State game saat ini.
 * @param {number} indexPemain - Index pemain yang dievaluasi.
 * @param {number} [simulasi=300] - Jumlah simulasi.
 * @returns {number} Win rate estimasi.
 */
function estimasiWinRate(state, indexPemain, simulasi = 300) {
  if (!state?.pemain || !Array.isArray(state.pemain)) {
    throw new Error("State game tidak valid untuk estimasi win rate");
  }
  if (indexPemain < 0 || indexPemain >= state.pemain.length) {
    throw new Error("Index pemain tidak valid untuk estimasi win rate");
  }

  const hero = state.pemain[indexPemain];
  const lawan = state.pemain.filter(
    (_, i) => i !== indexPemain && !state.pemain[i].fold
  );
  if (lawan.length === 0) return 1;

  let menang = 0;
  let seri = 0;

  for (let s = 0; s < simulasi; s++) {
    const deck = [...state.deck];
    const komunitas = [...state.komunitas];
    acakArray(deck);
    
    // Lengkapi kartu komunitas
    while (komunitas.length < 5) {
      komunitas.push(deck.pop());
    }
    
    // Buat simulasi pemain
    const simPemain = [{ hand: hero.tangan }];
    for (let i = 0; i < lawan.length; i++) {
      simPemain.push({ hand: [deck.pop(), deck.pop()] });
    }
    
    const pemenangSim = dapatkanPemenang(simPemain, komunitas);
    if (pemenangSim.length === 1 && pemenangSim[0] === simPemain[0]) {
      menang++;
    } else if (pemenangSim.includes(simPemain[0])) {
      seri++;
    }
  }

  return (menang + seri / 2) / simulasi;
}

/**
 * Evaluasi kekuatan tangan berdasarkan posisi.
 * @param {number} posisi - Posisi pemain (0 = early, 1 = middle, 2 = late).
 * @param {number} winRate - Win rate dasar.
 * @returns {number} Win rate yang disesuaikan dengan posisi.
 */
function sesuaikanDenganPosisi(posisi, winRate) {
  const posisiMultiplier = [0.9, 1.0, 1.1]; // Early, Middle, Late
  return Math.min(1, winRate * posisiMultiplier[posisi]);
}

/**
 * Analisis pola taruhan lawan.
 * @param {Array} pemain - Daftar pemain.
 * @param {number} indexPemain - Index pemain yang dianalisis.
 * @returns {object} Analisis pola taruhan.
 */
function analisisPolaLawan(pemain, indexPemain) {
  const analisis = {
    agresivitas: 0.5,
    kecenderunganBluff: 0.3,
    konsistensi: 0.7,
  };
  
  // Analisis sederhana berdasarkan aksi terakhir
  pemain.forEach((p, i) => {
    if (i === indexPemain || p.fold) return;
    
    if (p.aksiTerakhir === "bet" || p.aksiTerakhir === "raise") {
      analisis.agresivitas += 0.1;
    } else if (p.aksiTerakhir === "check" || p.aksiTerakhir === "call") {
      analisis.agresivitas -= 0.05;
    }
  });
  
  return analisis;
}

/**
 * Strategi berdasarkan teori game Nash Equilibrium (sederhana).
 * @param {number} winRate - Win rate pemain.
 * @param {number} potOdds - Pot odds saat ini.
 * @param {object} polaLawan - Analisis pola lawan.
 * @returns {string} Aksi yang direkomendasikan.
 */
function strategiTeoriGame(winRate, potOdds, polaLawan) {
  const threshold = {
    fold: 0.2,
    call: 0.4,
    raise: 0.6,
  };
  
  // Adjust threshold berdasarkan pola lawan
  const adjustedThreshold = {
    fold: threshold.fold * (1 + polaLawan.agresivitas * 0.2),
    call: threshold.call * (1 + polaLawan.kecenderunganBluff * 0.3),
    raise: threshold.raise * (1 - polaLawan.konsistensi * 0.2),
  };
  
  if (winRate < adjustedThreshold.fold) {
    return "fold";
  } else if (winRate < adjustedThreshold.call) {
    return winRate > potOdds ? "call" : "fold";
  } else if (winRate < adjustedThreshold.raise) {
    return "call";
  } else {
    return "raise";
  }
}

export class BotPokerCanggih {
  /**
   * Buat instance bot AI baru.
   * @param {object} game - Engine game poker.
   * @param {object} state - State game saat ini.
   * @param {object} antrian - Antrian untuk mengirim aksi bot.
   * @param {"mudah"|"normal"|"sulit"} tingkatKesulitan - Tingkat kesulitan bot.
   */
  constructor(game, state, antrian = { push: () => {} }, tingkatKesulitan = "mudah") {
    if (!game || !state) {
      throw new Error("Game dan state diperlukan untuk inisialisasi BotPokerCanggih");
    }
    this.game = game;
    this.state = state;
    this.antrian = antrian;
    this.tingkatKesulitan = tingkatKesulitan;
    
    // Konfigurasi berdasarkan tingkat kesulitan
    this.konfigurasi = {
      mudah: {
        simulasi: 100,
        agresivitas: 0.3,
        bluffRate: 0.1,
        thinkTime: { min: 800, max: 1500 },
      },
      normal: {
        simulasi: 300,
        agresivitas: 0.5,
        bluffRate: 0.2,
        thinkTime: { min: 1200, max: 2500 },
      },
      sulit: {
        simulasi: 600,
        agresivitas: 0.7,
        bluffRate: 0.3,
        thinkTime: { min: 2000, max: 4000 },
      },
    };
  }

  /**
   * Jalankan aksi bot berdasarkan state dan tingkat kesulitan.
   */
  jalankan() {
    const aksi = this.game.aksiTersedia(this.state);
    if (!aksi.length) {
      console.error("BotPokerCanggih.jalankan: tidak ada aksi tersedia");
      return;
    }

    const config = this.konfigurasi[this.tingkatKesulitan];
    const check = aksi.find((a) => a.type === "check");
    const call = aksi.find((a) => a.type === "call");
    const bet = aksi.find((a) => a.type === "bet");
    const raise = aksi.find((a) => a.type === "raise");

    // Strategi untuk tingkat mudah (lebih sederhana)
    if (this.tingkatKesulitan === "mudah") {
      if (check) return this.antrian.push({ action: "check" });
      if (call) return this.antrian.push({ action: "call" });
      if (bet) {
        const jumlah = Math.min(20, bet.max || 20);
        return this.antrian.push({ action: "bet", jumlah });
      }
      return this.antrian.push({ action: "fold" });
    }

    // Analisis untuk tingkat normal dan sulit
    const winRate = estimasiWinRate(
      this.state,
      this.state.pemainSaatIni,
      config.simulasi
    );
    
    const ukuranPot = this.game.hitungPot(this.state);
    const jumlahCall = this.game.jumlahCall(this.state, this.state.pemainSaatIni);
    const potOdds = jumlahCall > 0 ? hitungPotOdds(ukuranPot, jumlahCall) : 0;
    
    // Analisis pola lawan
    const polaLawan = analisisPolaLawan(this.state.pemain, this.state.pemainSaatIni);
    
    // Tentukan posisi pemain (sederhana)
    const totalPemain = this.state.pemain.length;
    const posisiIndex = Math.floor(this.state.pemainSaatIni / totalPemain * 3);
    const winRateDisesuaikan = sesuaikanDenganPosisi(posisiIndex, winRate);

    // Strategi berdasarkan tingkat kesulitan
    if (this.tingkatKesulitan === "normal") {
      // Strategi normal dengan beberapa bluff
      const shouldBluff = Math.random() < config.bluffRate;
      const effectiveWinRate = shouldBluff ? Math.min(1, winRateDisesuaikan + 0.2) : winRateDisesuaikan;
      
      if ((bet || raise) && (effectiveWinRate > potOdds + 0.15 || shouldBluff)) {
        const aksiTaruhan = bet || raise;
        const jumlah = pilihJumlahTaruhan(aksiTaruhan, ukuranPot, effectiveWinRate, config.agresivitas);
        return this.antrian.push({ action: aksiTaruhan.type, jumlah });
      }
      if (call && effectiveWinRate > potOdds) {
        return this.antrian.push({ action: "call" });
      }
      if (check) return this.antrian.push({ action: "check" });
      return this.antrian.push({ action: "fold" });
    }

    // Strategi sulit dengan teori game
    if (this.tingkatKesulitan === "sulit") {
      const rekomendasiAksi = strategiTeoriGame(winRateDisesuaikan, potOdds, polaLawan);
      
      // Adjust untuk bluff dan agresivitas
      const shouldBluff = Math.random() < config.bluffRate;
      const adjustedWinRate = shouldBluff ? Math.min(1, winRateDisesuaikan + 0.25) : winRateDisesuaikan;
      
      if (rekomendasiAksi === "raise" && raise) {
        const jumlah = pilihJumlahTaruhan(raise, ukuranPot, adjustedWinRate, config.agresivitas);
        return this.antrian.push({ action: "raise", jumlah });
      }
      if (rekomendasiAksi === "raise" && bet) {
        const jumlah = pilihJumlahTaruhan(bet, ukuranPot, adjustedWinRate, config.agresivitas);
        return this.antrian.push({ action: "bet", jumlah });
      }
      if (rekomendasiAksi === "call" && call) {
        return this.antrian.push({ action: "call" });
      }
      if (rekomendasiAksi === "call" && check) {
        return this.antrian.push({ action: "check" });
      }
      if (check) return this.antrian.push({ action: "check" });
      return this.antrian.push({ action: "fold" });
    }

    return this.antrian.push({ action: "fold" });
  }

  /**
   * Dapatkan waktu berpikir bot berdasarkan tingkat kesulitan.
   * @returns {number} Waktu berpikir dalam milidetik.
   */
  dapatkanWaktuBerpikir() {
    const config = this.konfigurasi[this.tingkatKesulitan];
    const { min, max } = config.thinkTime;
    return min + Math.random() * (max - min);
  }
}