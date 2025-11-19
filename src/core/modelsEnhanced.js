// src/core/models.js

import { getWinners as evaluasiPemenang } from "./handEvaluator";

// Utilitas
const NILAI_KARTU = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"
];
const JENIS_KARTU = ["C", "D", "H", "S"]; // Clubs, Diamonds, Hearts, Spades

/**
 * Generate deck baru yang sudah diacak.
 * @returns {Array} Deck yang sudah diacak.
 */
function buatDeck() {
  const deck = [];
  for (const r of NILAI_KARTU) {
    for (const s of JENIS_KARTU) {
      deck.push({ rank: r, suit: s });
    }
  }
  // Algoritma Fisher-Yates untuk mengacak deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Deep clone objek menggunakan structuredClone jika tersedia.
 * @param {object} obj - Objek yang akan di-clone.
 * @returns {object} Objek hasil clone.
 */
export function cloneObjek(obj) {
  if (obj === null || obj === undefined) {
    throw new Error("cloneObjek membutuhkan objek yang valid");
  }
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  const seen = new WeakMap();
  const clone = (value) => {
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) return seen.get(value);

    let result;
    if (value instanceof Date) {
      result = new Date(value);
    } else if (value instanceof Map) {
      result = new Map();
      seen.set(value, result);
      value.forEach((v, k) => result.set(clone(k), clone(v)));
    } else if (value instanceof Set) {
      result = new Set();
      seen.set(value, result);
      value.forEach((v) => result.add(clone(v)));
    } else if (Array.isArray(value)) {
      result = [];
      seen.set(value, result);
      value.forEach((v, i) => {
        result[i] = clone(v);
      });
    } else {
      result = {};
      seen.set(value, result);
      Object.keys(value).forEach((k) => {
        result[k] = clone(value[k]);
      });
    }
    return result;
  };
  return clone(obj);
}

// Build pemain baru dari template atau objek pemain sebelumnya
function buildPemain(base, deck) {
  return {
    nama: base.nama,
    adalahBot: !!base.adalahBot,
    tingkatKesulitan: base.tingkatKesulitan || "mudah",
    avatar: base.avatar || "/assets/others/dealer.png",
    chips: base.chips ?? 1000,
    taruhanSaatIni: 0,
    totalTaruhan: 0,
    fold: false,
    tangan: [deck.pop(), deck.pop()],
    aksiTerakhir: null,
    jumlahAksiTerakhir: 0,
    allIn: false,
  };
}

/**
 * Dapatkan index pemain aktif berikutnya.
 * @param {Array} pemain - Daftar pemain.
 * @param {number} dari - Index awal.
 * @returns {number} Index pemain aktif berikutnya.
 */
function indexAktifBerikutnya(pemain, dari) {
  if (!Array.isArray(pemain)) {
    throw new Error("indexAktifBerikutnya membutuhkan array pemain");
  }
  const aktif = pemain.filter((p) => !p.fold && p.chips > 0);
  if (aktif.length === 0) return -1;
  const n = pemain.length;
  let idx = (dari + 1) % n;
  while (pemain[idx].fold || pemain[idx].chips === 0) {
    idx = (idx + 1) % n;
  }
  return idx;
}

/**
 * Cek apakah semua pemain aktif sudah match dengan taruhan saat ini.
 * @param {Array} pemain - Daftar pemain.
 * @returns {boolean} True jika semua taruhan sudah match.
 */
function semuaAktifMatchTaruhan(pemain) {
  if (!Array.isArray(pemain)) {
    throw new Error("semuaAktifMatchTaruhan membutuhkan array pemain");
  }
  let target = null;
  for (const p of pemain) {
    if (p.fold || p.chips === 0) continue;
    // Semua pemain aktif harus sudah melakukan aksi
    if (p.aksiTerakhir === null && !p.allIn) return false;
    if (target === null) target = p.taruhanSaatIni;
    if (p.taruhanSaatIni !== target && !p.allIn) return false;
  }
  return true;
}

/**
 * Hitung jumlah pemain aktif (tidak fold).
 * @param {Array} pemain - Daftar pemain.
 * @returns {number} Jumlah pemain aktif.
 */
function hitungAktif(pemain) {
  if (!Array.isArray(pemain)) {
    throw new Error("hitungAktif membutuhkan array pemain");
  }
  return pemain.filter((p) => !p.fold).length;
}

/**
 * Bagi pot ke pemenang secara merata.
 * Hitung pot utama dan side pot berdasarkan kontribusi total setiap pemain.
 * @returns {Array} Array pot, masing-masing memiliki jumlah dan daftar pemain yang berhak.
 */
function distribusikanPot(pemain) {
  if (!Array.isArray(pemain)) {
    throw new Error("distribusikanPot membutuhkan array pemain");
  }
  const kontribusi = pemain
    .map((p, i) => ({ i, jumlah: p.totalTaruhan || 0 }))
    .filter((c) => c.jumlah > 0)
    .sort((a, b) => a.jumlah - b.jumlah);

  const pots = [];
  let sebelumnya = 0;
  for (let i = 0; i < kontribusi.length; i++) {
    const { jumlah } = kontribusi[i];
    const aktif = kontribusi.slice(i).map((c) => c.i);
    if (jumlah > sebelumnya) {
      pots.push({ 
        jumlah: (jumlah - sebelumnya) * aktif.length, 
        pemain: aktif 
      });
      sebelumnya = jumlah;
    }
  }
  return pots;
}

/**
 * Distribusikan semua pot kepada pemenang yang memenuhi syarat.
 */
function berikanPot(state) {
  const pots = distribusikanPot(state.pemain);
  const pemenang = new Set();
  
  for (const pot of pots) {
    const peserta = pot.pemain.filter((i) => !state.pemain[i].fold);
    if (peserta.length === 0) continue;
    
    const evalPemain = peserta.map((i) => ({ ...state.pemain[i], i }));
    const pemenangPot = evaluasiPemenang(evalPemain, state.komunitas).map((w) => w.i);
    
    pemenangPot.forEach((w) => pemenang.add(w));
    const bagian = Math.floor(pot.jumlah / pemenangPot.length);
    const sisa = pot.jumlah % pemenangPot.length;
    
    pemenangPot.forEach((idx) => {
      state.pemain[idx].chips += bagian;
    });
    if (sisa > 0) {
      state.pemain[pemenangPot[0]].chips += sisa;
    }
  }
  
  state.pot = 0;
  state.pemenang = Array.from(pemenang);
}

export default class GamePoker {
  /**
   * Inisialisasi instance game poker.
   * @param {Array} pemain - Daftar pemain awal.
   */
  constructor(pemain = []) {
    this.templatePemain = pemain.map((p) => ({
      nama: p.nama,
      adalahBot: !!p.adalahBot,
      tingkatKesulitan: p.tingkatKesulitan || "mudah",
      avatar: p.avatar || "/assets/others/dealer.png",
    }));
    this.indexDealer = 0;
  }

  /**
   * Mulai hand baru atau game baru.
   * @param {object|null} stateSebelumnya - State game sebelumnya jika melanjutkan.
   * @returns {object} State game baru.
   */
  mulai(stateSebelumnya = null) {
    const deck = buatDeck();
    let pemain;
    let indexDealer = this.indexDealer;

    if (!stateSebelumnya) {
      pemain = this.templatePemain.map((p) => buildPemain(p, deck));
      indexDealer = 0;
    } else {
      pemain = stateSebelumnya.pemain.map((p) => buildPemain(p, deck));
      indexDealer = (stateSebelumnya.indexDealer + 1) % pemain.length;
    }

    const smallBlind = 10;
    const bigBlind = 20;
    const indexSB = (indexDealer + 1) % pemain.length;
    const indexBB = (indexDealer + 2) % pemain.length;
    
    // Set small blind
    pemain[indexSB].taruhanSaatIni = Math.min(smallBlind, pemain[indexSB].chips);
    pemain[indexSB].chips -= pemain[indexSB].taruhanSaatIni;
    pemain[indexSB].totalTaruhan += pemain[indexSB].taruhanSaatIni;
    if (pemain[indexSB].chips === 0) pemain[indexSB].allIn = true;
    
    // Set big blind
    pemain[indexBB].taruhanSaatIni = Math.min(bigBlind, pemain[indexBB].chips);
    pemain[indexBB].chips -= pemain[indexBB].taruhanSaatIni;
    pemain[indexBB].totalTaruhan += pemain[indexBB].taruhanSaatIni;
    if (pemain[indexBB].chips === 0) pemain[indexBB].allIn = true;

    this.indexDealer = indexDealer;

    return {
      pemain,
      pot: 0,
      deck,
      komunitas: [],
      indexDealer,
      pemainSaatIni: (indexBB + 1) % pemain.length,
      ronde: "Preflop", // Preflop -> Flop -> Turn -> River -> Showdown
      pemenang: [],
      gameSelesai: false,
    };
  }

  // Fungsi turunan
  /**
   * Dapatkan taruhan tertinggi saat ini di meja.
   */
  taruhanSaatIni(state) {
    if (!state?.pemain) {
      throw new Error("taruhanSaatIni membutuhkan state yang valid");
    }
    return Math.max(...state.pemain.map((p) => p.taruhanSaatIni));
  }

  /**
   * Jumlah yang dibutuhkan pemain untuk call.
   */
  jumlahCall(state, idx) {
    if (!state?.pemain || !state.pemain[idx]) {
      throw new Error("jumlahCall membutuhkan index pemain yang valid");
    }
    const p = state.pemain[idx];
    return Math.max(0, this.taruhanSaatIni(state) - p.taruhanSaatIni);
  }

  /**
   * Tentukan aksi yang tersedia untuk pemain saat ini.
   */
  aksiTersedia(state) {
    if (!state?.pemain) {
      throw new Error("aksiTersedia membutuhkan state yang valid");
    }
    const p = state.pemain[state.pemainSaatIni];
    if (state.gameSelesai || state.ronde === "Showdown") return [];
    if (p.fold || p.chips === 0) return [];

    const callAmount = this.jumlahCall(state, state.pemainSaatIni);
    const aksi = [];
    
    // Urutan tombol: Fold, Check/Call, Bet/Raise
    aksi.push({ type: "fold" });
    
    if (callAmount === 0) {
      aksi.push({ type: "check" });
      if (p.chips > 0) aksi.push({ type: "bet", min: 10, max: p.chips });
    } else {
      const maxCall = Math.min(callAmount, p.chips);
      if (maxCall > 0) {
        aksi.push({ type: "call", jumlah: maxCall });
      }
      if (p.chips > callAmount) {
        aksi.push({ type: "raise", min: callAmount + 10, max: p.chips });
      }
    }
    
    return aksi;
  }

  /**
   * Hitung total pot termasuk taruhan saat ini.
   */
  hitungPot(state) {
    if (!state?.pemain) {
      throw new Error("hitungPot membutuhkan state yang valid");
    }
    return state.pot + state.pemain.reduce((s, p) => s + p.taruhanSaatIni, 0);
  }

  /**
   * Tentukan status game secara keseluruhan.
   */
  cekStatusGame(state) {
    if (!state) {
      throw new Error("cekStatusGame membutuhkan state");
    }
    if (state.gameSelesai) return "selesai";
    if (state.ronde === "Showdown") return "showdown";
    return "bermain";
  }

  /**
   * Tentukan index pemenang saat showdown.
   */
  cekPemenang(state) {
    if (!state?.pemain) {
      throw new Error("cekPemenang membutuhkan state yang valid");
    }
    if (state.ronde !== "Showdown") return [];
    const aktif = state.pemain
      .map((p, i) => ({ ...p, i }))
      .filter((p) => !p.fold);
    if (aktif.length === 1) return [aktif[0].i];

    const pemenang = evaluasiPemenang(aktif, state.komunitas);
    return pemenang.map((w) => w.i);
  }

  /**
   * Terapkan aksi pemain secara immutable dan kembalikan state baru.
   */
  terapkanAksi(state, aksi, jumlah = 0) {
    if (!state?.pemain) {
      throw new Error("terapkanAksi membutuhkan state yang valid");
    }
    if (!["fold", "check", "call", "bet", "raise"].includes(aksi)) {
      throw new Error(`Aksi tidak dikenal: ${aksi}`);
    }
    
    const s = cloneObjek(state);
    const idx = s.pemainSaatIni;
    const p = s.pemain[idx];
    const callSebelumnya = this.jumlahCall(s, idx);

    if (aksi === "fold") {
      p.fold = true;
      p.aksiTerakhir = "fold";
      p.jumlahAksiTerakhir = 0;
    } else if (aksi === "check") {
      p.aksiTerakhir = "check";
      p.jumlahAksiTerakhir = 0;
    } else if (aksi === "call") {
      const butuh = callSebelumnya;
      const bayar = Math.min(butuh, p.chips);
      p.chips -= bayar;
      p.taruhanSaatIni += bayar;
      p.totalTaruhan += bayar;
      p.aksiTerakhir = "call";
      p.jumlahAksiTerakhir = bayar;
      if (p.chips === 0) p.allIn = true;
    } else if (aksi === "bet" || aksi === "raise") {
      const total = aksi === "bet" ? jumlah : callSebelumnya + jumlah;
      const bayar = Math.min(total, p.chips);
      p.chips -= bayar;
      p.taruhanSaatIni += bayar;
      p.totalTaruhan += bayar;
      p.aksiTerakhir = aksi;
      p.jumlahAksiTerakhir = bayar;
      if (p.chips === 0) p.allIn = true;
    }

    // Cek jika hanya satu pemain yang tersisa
    if (hitungAktif(s.pemain) === 1) {
      s.pot += s.pemain.reduce((sum, pl) => sum + pl.taruhanSaatIni, 0);
      s.pemain.forEach((pl) => {
        pl.taruhanSaatIni = 0;
        pl.aksiTerakhir = null;
        pl.jumlahAksiTerakhir = 0;
      });
      s.ronde = "Showdown";
      berikanPot(s);
      s.gameSelesai = true;
      return s;
    }

    // Cek jika semua pemain aktif sudah match taruhan
    if (semuaAktifMatchTaruhan(s.pemain)) {
      s.pot += s.pemain.reduce((sum, pl) => sum + pl.taruhanSaatIni, 0);
      s.pemain.forEach((pl) => {
        pl.taruhanSaatIni = 0;
        pl.aksiTerakhir = null;
        pl.jumlahAksiTerakhir = 0;
      });

      // Pindah ke ronde berikutnya
      if (s.ronde === "Preflop") {
        s.komunitas.push(s.deck.pop(), s.deck.pop(), s.deck.pop());
        s.ronde = "Flop";
      } else if (s.ronde === "Flop") {
        s.komunitas.push(s.deck.pop());
        s.ronde = "Turn";
      } else if (s.ronde === "Turn") {
        s.komunitas.push(s.deck.pop());
        s.ronde = "River";
      } else if (s.ronde === "River") {
        s.ronde = "Showdown";
        berikanPot(s);
        s.gameSelesai = true;
      }
    }

    // Cek jika game harus berakhir karena semua all-in
    const aktifDenganChip = s.pemain.filter(
      (pl) => !pl.fold && pl.chips > 0
    );

    if (!s.gameSelesai && s.ronde !== "Showdown" && aktifDenganChip.length <= 1) {
      while (s.komunitas.length < 5) {
        s.komunitas.push(s.deck.pop());
      }
      s.ronde = "Showdown";
      berikanPot(s);
      s.gameSelesai = true;
    }

    // Pindah ke pemain berikutnya jika game belum selesai
    if (!s.gameSelesai && s.ronde !== "Showdown") {
      const nextIdx = indexAktifBerikutnya(s.pemain, s.pemainSaatIni);
      s.pemainSaatIni = nextIdx !== -1 ? nextIdx : -1;
    }

    return s;
  }
}

export { distribusikanPot, berikanPot };