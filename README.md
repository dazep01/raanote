# 📖✍️ RaaNote

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Made with](https://img.shields.io/badge/Made%20with-HTML%2FCSS%2FJS-orange.svg)
![PDF Export](https://img.shields.io/badge/Export-PDF-red.svg)
![Offline Ready](https://img.shields.io/badge/Offline-Yes-brightgreen.svg)

**RaaNote** adalah aplikasi web modern untuk penulis novel.  
Dibangun hanya dengan **HTML, CSS, dan JavaScript (IndexedDB)** tanpa backend,  
sehingga bisa langsung dijalankan di browser.  

Cocok untuk penulis yang ingin mengelola project novel, menulis bab demi bab,  
dan mengekspor hasilnya ke PDF dengan sekali klik.


---

## ✨ Fitur Utama

### 📂 Manajemen Project
- Buat, simpan, dan hapus project novel  
- Import/Export project dalam format JSON  

### 📑 Bab & Editor
- Tambah bab baru dengan ringkasan opsional  
- Editor rich-text dengan toolbar *(Bold, Italic, Underline, Heading, List)*  
- Hitung jumlah kata otomatis per bab & total project  
- Drag & drop untuk mengatur urutan bab  

### 📄 Ekspor PDF
- Ekspor seluruh novel atau bab tertentu  
- Pilihan font, ukuran font, margin, dan orientasi halaman  
- Preview PDF sebelum diunduh  
- Halaman judul & daftar isi otomatis  
- Penomoran halaman otomatis  

### 💾 Penyimpanan Offline
- Data project tersimpan di browser *(IndexedDB)*  
- Auto-save saat mengetik  

### 🎨 UI/UX
- Desain modern dengan tema bersih  
- Responsif di desktop & mobile  
- Notifikasi toast & status bar  


---

## 🚀 Cara Menjalankan

### 1. Clone repositori ini:
   git clone https://github.com/dazep01/raanote.git

### 2. Buka file index.html langsung di browser.
  Tidak perlu server tambahan, semua berjalan di sisi klien.


---

## 📦 Dependensi

- **jsPDF** — untuk ekspor ke PDF
- **Google Fonts** — Inter & Source Serif Pro

Semua dependensi dimuat melalui CDN, jadi tidak perlu instalasi tambahan.


---

## 📂 Struktur Project

raanote/

│── [index.html](./index.html)       # Aplikasi utama

│── [assets/](./assets)              # Ikon & gambar pendukung

│── [README.md](./README.md)         # Dokumentasi

│── [LICENSE](./LICENSE)             # Lisensi


---

## 💡 Catatan

- Semua data tersimpan di browser, tidak ada server/backend
- Gunakan fitur Export Project (JSON) untuk backup manual
- Untuk hasil PDF lebih rapi, gunakan font bawaan seperti Source Serif Pro


---

## 🖊️ Lisensi

MIT License © 2025
Dibuat dengan ❤️ untuk para penulis.
