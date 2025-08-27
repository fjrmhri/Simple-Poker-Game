# Simple Poker Game

Simple Poker Game adalah implementasi ringkas gim poker Texas Hold'em berbasis React. Proyek ini menampilkan antarmuka meja, avatar pemain, serta lawan bot dengan beberapa tingkat kesulitan.

## Fitur

- Permainan Texas Hold'em melawan bot AI
- Tiga level kesulitan bot: **easy**, **normal**, dan **hard**
- Avatar pemain dapat diganti langsung dari antarmuka
- Animasi menggunakan Framer Motion dan styling Tailwind CSS
- Peringatan ketika chip habis dan tampilan pemenang

## Dependensi Utama

- React 19
- React Router DOM 7
- Tailwind CSS 3
- Styled Components 6
- Framer Motion 12

Instal semua dependensi dengan:

```bash
npm install
```

## Menjalankan dalam Mode Pengembangan

```bash
npm start
```

Buka [http://localhost:3000](http://localhost:3000) di peramban untuk melihat aplikasi. Halaman akan otomatis dimuat ulang ketika ada perubahan kode.

## Membangun untuk Produksi

```bash
npm run build
```

Berhasil build akan menghasilkan berkas statis di folder `build` yang siap dideploy.

## Pengujian

```bash
npm test
```

Menjalankan pengujian unit menggunakan skrip bawaan Create React App.

## Detail Permainan

- Setiap pemain mulai dengan **1000 chip**
- Small blind: **10**, big blind: **20**
- Alur ronde: Preflop → Flop → Turn → River → Showdown

## Level AI

- **Easy**: cenderung check/call dan bertaruh kecil
- **Normal**: menghitung probabilitas kemenangan secara moderat lalu memutuskan aksi
- **Hard**: simulasi lebih banyak dan strategi lebih agresif

## Mengganti Avatar

Klik gambar avatar pemain Anda lalu pilih berkas gambar baru. Avatar hanya berubah untuk pengguna lokal dan tidak disimpan ke server.

## Lisensi

Proyek ini dirilis di bawah lisensi **MIT**.

## Kredit Aset

- Gambar kartu dan avatar di direktori `public/assets` digunakan hanya untuk keperluan demo
- Efek suara `minecraft_level_up.mp3` di `public/sounds` berasal dari gim Minecraft dan merupakan hak cipta Mojang Studios
- Latar belakang dan ikon lain adalah milik masing-masing pembuatnya

Gunakan aset-aset tersebut secara bertanggung jawab dan pastikan Anda memiliki hak untuk mendistribusikannya kembali.

