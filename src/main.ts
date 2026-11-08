import './style.css';
import type { ItemTugas, StatusTugas } from './types';
// State aplikasi menggunakan Array of ItemTugas
let daftarTugas: ItemTugas[] = [
  { id: 1, judul: 'Laporan Usability Testing', matkul: 'IMK', deadline: '2026-11-20', status: 'Belum Selesai' },
  { id: 2, judul: 'Tugas Web Vite TS', matkul: 'Pemrograman Web', deadline: '2026-11-30', status: 'Selesai' }
];

const app = document.querySelector<HTMLDivElement>('#app')!;

// Render Tampilan HTML Aplikasi
function render() {
  // Menggunakan Environment Variables
  const appTitle = import.meta.env.VITE_APP_NAME || 'Pengelola Tugas Kuliah';
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  app.innerHTML = `
    <div style="max-width: 650px; margin: 30px auto; font-family: sans-serif; padding: 25px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h2 style="color: #333; margin-bottom: 5px;">${appTitle}</h2>
      <p style="font-size: 13px; color: #666; margin-top: 0;">Versi Aplikasi: v${appVersion}</p>
      
      <!-- Form Tambah Tugas -->
      <form id="form-tugas" style="display: flex; gap: 8px; margin-bottom: 20px;">
        <input type="text" id="judul" placeholder="Nama Tugas Kuliah..." required style="flex:2; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
        <input type="text" id="matkul" placeholder="Mata Kuliah" required style="flex:1; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
        <button type="submit" style="padding: 10px 18px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Tambah</button>
      </form>

      <!-- Daftar Tugas -->
      <ul id="list-tugas" style="list-style: none; padding: 0;">
        ${daftarTugas.map(tugas => `
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; border: 1px solid #eee; border-radius: 6px; background: ${tugas.status === 'Selesai' ? '#f0fff0' : '#fff'}">
            <div>
              <strong style="font-size: 15px; text-decoration: ${tugas.status === 'Selesai' ? 'line-through' : 'none'};">${tugas.judul}</strong> 
              <small style="color: #555;">(${tugas.matkul})</small><br>
              <span style="font-size: 12px; font-weight: bold; color: ${tugas.status === 'Selesai' ? 'green' : 'orange'};">Status: ${tugas.status}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button onclick="toggleStatus(${tugas.id})" style="padding: 6px 10px; background: #ffc107; border: none; border-radius: 4px; cursor: pointer;">${tugas.status === 'Selesai' ? 'Batal' : 'Selesai'}</button>
              <button onclick="hapusTugas(${tugas.id})" style="padding: 6px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Hapus</button>
            </div>
          </li>
        `).join('')}
      </ul>

      <!-- Dokumentasi / Penjelasan Singkat (Sesuai Ketentuan Pengumpulan No 4) -->
      <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;">
      <section style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 13px; color: #444;">
        <h3 style="margin-top: 0; color: #222;">Dokumentasi & Penjelasan Singkat:</h3>
        <p><strong>Git & GitHub:</strong> Menggunakan minimal 5 commit, 2 branch (main & feature), penanganan <em>merge conflict</em>, dan <em>Pull Request</em>.</p>
        <p><strong>Vite & npm:</strong> Vite bertindak sebagai dev server & bundler berkecepatan tinggi, dikelola via <code>package.json</code> dan script npm.</p>
        <p><strong>TypeScript:</strong> Memanfaatkan <em>primitive types</em>, <em>array</em>, <em>interface</em>, <em>type alias</em>, <em>union type</em>, dan <em>generics</em> untuk type safety.</p>
        <p><strong>Environment Variables:</strong> Konfigurasi variabel aplikasi dimuat melalui file <code>.env</code> menggunakan <code>import.meta.env</code>.</p>
      </section>
    </div>
  `;

  // Event Listener Form Submit
  document.querySelector('#form-tugas')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const judulInput = (document.querySelector('#judul') as HTMLInputElement).value;
    const matkulInput = (document.querySelector('#matkul') as HTMLInputElement).value;
    
    tambahTugas(judulInput, matkulInput);
  });
}

// Logika Tambah Tugas
function tambahTugas(judul: string, matkul: string) {
  const tugasBaru: ItemTugas = {
    id: Date.now(),
    judul,
    matkul,
    deadline: new Date().toISOString().split('T')[0],
    status: 'Belum Selesai'
  };
  daftarTugas.push(tugasBaru);
  
  // Contoh penerapan fungsi Generics
  const res = bungkusResponse(daftarTugas, 'Tugas berhasil diperbarui');
  console.log(res.message);
  
  render();
}

// Fungsi global untuk interaksi tombol HTML
(window as any).toggleStatus = (id: number) => {
  daftarTugas = daftarTugas.map(t => {
    if (t.id === id) {
      const statusBaru: StatusTugas = t.status === 'Selesai' ? 'Belum Selesai' : 'Selesai';
      return { ...t, status: statusBaru };
    }
    return t;
  });
  render();
};

(window as any).hapusTugas = (id: number) => {
  daftarTugas = daftarTugas.filter(t => t.id !== id);
  render();
};

// Render awal saat aplikasi dibuka
render();
// Fungsi helper untuk membungkus respons
function bungkusResponse(data: any, message: string) {
  return {
    message: message,
    data: data
  };
}