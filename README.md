<p align="center">
  <img src="https://img.shields.io/github/stars/fjrmhri/Simple-Poker-Game?style=for-the-badge&logo=github&color=8b5cf6" alt="Stars"/>
  <img src="https://img.shields.io/github/license/fjrmhri/Simple-Poker-Game?style=for-the-badge&color=10b981" alt="License"/>
  <img src="https://img.shields.io/badge/React-19.1.1-61dafb?style=for-the-badge&logo=react&logoColor=61dafb" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-8.3.3-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Framer_Motion-12.23.12-ff4088?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"/>
</p>

# ♠️ PokeReact – Neon Texas Hold'em

PokeReact adalah pengalaman Texas Hold'em tunggal yang dibangun dengan React, Vite, Tailwind CSS, dan Framer Motion. Fokusnya adalah alur meja yang sinematik, bot yang responsif, serta progresi misi dan leaderboard lokal tanpa mengubah UI/UX yang sudah stabil.

## ✨ Fitur Utama
- **Meja modern** dengan animasi komunitas dan tata letak kursi responsif.
- **Profil pemain**: pilih avatar, warna aksen, dan tagline sebelum duduk di meja.
- **HUD dinamis**: statistik, misi, leaderboard, bonus harian, serta obrolan dealer/bot.
- **Logika game lengkap**: ronde taruhan, side pot, evaluasi pemenang, dan aksi bot.
- **Audio imersif**: suara kartu, chip, dan fanfare kemenangan yang bisa dimute.

## 🚀 Cara Instalasi & Menjalankan
```bash
git clone https://github.com/fjrmhri/Simple-Poker-Game.git
cd Simple-Poker-Game
npm install
npm run dev
```
Buka `http://localhost:3000` untuk mulai bermain. Membutuhkan Node.js 20.19+ atau 22.12+.

Perintah lain:
- `npm run build`: build produksi ke folder `dist/`.
- `npm run preview`: menjalankan hasil build secara lokal.
- `npm run lint`: memeriksa kode dengan ESLint.

## 🔧 Konfigurasi
- Aset suara berada di `public/sounds/`; ganti file bila ingin efek berbeda.
- Penyimpanan lokal (`localStorage`) dipakai untuk profil, misi, leaderboard, dan status bonus harian.
- Tidak ada variabel lingkungan wajib; pastikan port 3000 bebas saat menjalankan aplikasi.
- Bila kelak butuh variabel lingkungan, simpan di `.env` lokal (sudah di-ignore Git) dengan awalan `VITE_` dan baca lewat `import.meta.env.VITE_NAMA`.

## 🧪 Testing
```bash
npm test           # sekali jalan (Vitest)
npm run test:watch # mode watch
```
Test berada di `src/**/__tests__/` dan `*.test.js(x)`: evaluasi tangan, alur taruhan, side pot, aturan heads-up/minimum raise, hook mesin poker, dan timer giliran.

## 🗂️ Struktur Proyek Singkat
- `src/App.jsx`: alur utama permainan, misi, bonus, dan integrasi HUD.
- `src/components/`: ActionBar, meja, kursi pemain, HUD, modal, serta layar awal.
- `src/core/`: logika inti (model permainan, evaluator kartu, dan bot dasar).
- `src/hooks/`: utilitas React untuk audio, tone, penyimpanan lokal, dan mesin poker.

## 📄 Lisensi
Proyek ini berlisensi MIT. Silakan gunakan dan kembangkan sesuai kebutuhan.
