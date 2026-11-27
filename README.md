# Todo Kuliah

Aplikasi pengelola tugas dan jadwal kuliah berbasis web. Semua data disimpan di
`localStorage` browser, jadi aplikasi dapat berjalan tanpa backend.

**Demo:** https://todo-kuliah-plum.vercel.app

## Fitur

- **Manajemen tugas** — tambah, edit, hapus, dan ubah status tugas (Belum Selesai / Selesai).
- **Pengingat tenggat** — tugas yang melewati tanggal deadline ditandai sebagai *Terlambat*.
- **Jadwal mata kuliah** — kelola nama mata kuliah, SKS, hari, jam, dan ruangan, lengkap dengan total SKS.
- **Filter daftar tugas** — saring tugas berdasarkan mata kuliah dan hari kuliah.
- **Ringkasan progres** — kartu statistik total tugas, belum selesai, dan selesai.
- **Penyimpanan lokal** — data tugas dan jadwal otomatis tersimpan di browser.
- **Validasi data** — data dari `localStorage` diperiksa sebelum ditampilkan, dan teks di-*escape* saat dirender.

## Teknologi

| Komponen | Keterangan |
| --- | --- |
| Bahasa | TypeScript |
| Build tool | Vite |
| Styling | CSS murni (`src/style.css`) |
| Penyimpanan | LocalStorage |
| Arsitektur | Vanilla TypeScript, tanpa framework UI |

## Menjalankan Proyek

```bash
# 1. Install dependency
npm install

# 2. Salin konfigurasi environment
cp .env.example .env

# 3. Jalankan server pengembangan
npm run dev
```

Buka alamat yang ditampilkan Vite (biasanya `http://localhost:5173`).

### Perintah lain

```bash
npm run build    # Type-check TypeScript lalu build ke folder dist/
npm run preview  # Menjalankan hasil build secara lokal
```

## Struktur Proyek

```
todo-kuliah/
├─ index.html          # Halaman utama
├─ public/             # Aset statis
├─ src/
│  ├─ main.ts          # Logika aplikasi dan rendering UI
│  ├─ storage.ts       # Helper generik LocalStorage
│  ├─ types.ts         # Tipe data, interface, dan data awal
│  └─ style.css        # Seluruh styling aplikasi
├─ .env.example        # Contoh variabel environment
└─ vite.config.ts      # Konfigurasi Vite
```

## Variabel Environment

| Variabel | Default | Deskripsi |
| --- | --- | --- |
| `VITE_APP_NAME` | `Todo Kuliah` | Nama aplikasi pada header dan judul halaman |
| `VITE_APP_VERSION` | `1.0.0` | Versi yang ditampilkan pada badge header |

## Menyetel Ulang Data

Data tugas dan jadwal tersimpan di LocalStorage browser. Untuk mengosongkan
seluruh data, buka DevTools → Console lalu jalankan:

```js
localStorage.removeItem('todo-kuliah-tugas');
localStorage.removeItem('todo-kuliah-jadwal');
```

Muat ulang halaman setelahnya agar jadwal default dibuat kembali.

## Lisensi

ISC
