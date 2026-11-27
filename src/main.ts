import './style.css';
import { muatDariStorage, simpanKeStorage } from './storage';
import {
  bungkusResponse,
  JADWAL_MATA_KULIAH_DEFAULT,
  type HariKuliah,
  type ItemTugas,
  type MataKuliah,
  type StatusTugas
} from './types';

// Primitive types: string untuk kunci penyimpanan dan konfigurasi aplikasi.
const KUNCI_STORAGE: string = 'todo-kuliah-tugas';
const KUNCI_STORAGE_JADWAL: string = 'todo-kuliah-jadwal';
const appName: string = import.meta.env.VITE_APP_NAME || 'Todo Kuliah';
const appVersion: string = import.meta.env.VITE_APP_VERSION || '1.0.0';
const HARI_KULIAH: HariKuliah[] = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Belum Diatur'
];

// Array dan interface: daftar tugas bertipe ItemTugas[].
let daftarTugas: ItemTugas[] = [];

// Array dan interface: daftar jadwal bertipe MataKuliah[].
let daftarMataKuliah: MataKuliah[] = [];

// Primitive types: state antarmuka menggunakan tipe eksplisit.
let jumlahTugas: number = 0;
let sedangEdit: boolean = false;
let idTugasEdit: number | null = null;
let sedangEditJadwal: boolean = false;
let idJadwalEdit: string | null = null;
let filterMatkul: string = '';
let filterHari: HariKuliah | '' = '';
let pesanAplikasi: string = '';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Elemen aplikasi #app tidak ditemukan.');
}

const root = app;

document.title = `${appName} - Pengelola Tugas Kuliah`;

// Type alias dan union type: memvalidasi nilai hari yang dibaca dari storage.
function isHariKuliah(value: unknown): value is HariKuliah {
  return HARI_KULIAH.includes(value as HariKuliah);
}

function isStatusTugas(value: unknown): value is StatusTugas {
  return value === 'Belum Selesai' || value === 'Selesai';
}

// Interface: type guard memeriksa struktur MataKuliah saat data dimuat.
function isMataKuliah(value: unknown): value is MataKuliah {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.nama === 'string' &&
    typeof item.sks === 'number' &&
    Number.isFinite(item.sks) &&
    item.sks > 0 &&
    isHariKuliah(item.hari) &&
    typeof item.jam === 'string' &&
    typeof item.ruangan === 'string' &&
    typeof item.wajib === 'boolean'
  );
}

function isItemTugas(value: unknown): value is ItemTugas {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'number' &&
    Number.isSafeInteger(item.id) &&
    typeof item.judul === 'string' &&
    typeof item.matkul === 'string' &&
    typeof item.deadline === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.deadline) &&
    isStatusTugas(item.status)
  );
}

// Generics: muat data tugas dengan tipe unknown sebelum divalidasi.
try {
  const dataTersimpan = muatDariStorage<unknown>(KUNCI_STORAGE, []);
  if (!Array.isArray(dataTersimpan)) {
    throw new Error('Format daftar tugas pada penyimpanan tidak valid.');
  }

  daftarTugas = dataTersimpan.filter(isItemTugas);
  if (daftarTugas.length !== dataTersimpan.length) {
    pesanAplikasi = 'Sebagian data tugas tidak valid dan tidak ditampilkan.';
  }
} catch (error) {
  pesanAplikasi =
    error instanceof Error
      ? error.message
      : 'Data tugas gagal dimuat dari penyimpanan.';
}

// Generics dan array: muat atau simpan data MataKuliah[] di LocalStorage.
try {
  const dataJadwal = muatDariStorage<MataKuliah[] | null>(
    KUNCI_STORAGE_JADWAL,
    null
  );
  if (dataJadwal === null) {
    daftarMataKuliah = JADWAL_MATA_KULIAH_DEFAULT.map((matkul) => ({
      ...matkul
    }));
    simpanKeStorage<MataKuliah[]>(KUNCI_STORAGE_JADWAL, daftarMataKuliah);
  } else if (Array.isArray(dataJadwal)) {
    daftarMataKuliah = dataJadwal.filter(isMataKuliah);
    if (daftarMataKuliah.length !== dataJadwal.length && !pesanAplikasi) {
      pesanAplikasi = 'Sebagian data jadwal tidak valid dan tidak ditampilkan.';
    }
  } else {
    throw new Error('Format jadwal mata kuliah pada penyimpanan tidak valid.');
  }
} catch (error) {
  daftarMataKuliah = JADWAL_MATA_KULIAH_DEFAULT.map((matkul) => ({
    ...matkul
  }));
  if (!pesanAplikasi) {
    pesanAplikasi =
      error instanceof Error
        ? error.message
        : 'Jadwal mata kuliah gagal dimuat dari penyimpanan.';
  }
}

// Keamanan: teks dinamis di-escape sebelum dimasukkan ke innerHTML.
function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[character] ?? character;
  });
}

function tanggalHariIni(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTanggal(tanggal: string): string {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(
    new Date(`${tanggal}T00:00:00`)
  );
}

// Generics: bungkusResponse<T> digunakan saat menyimpan daftar tugas.
function simpanDaftarTugas(tugas: ItemTugas[], pesan: string): void {
  try {
    const response = bungkusResponse(tugas, pesan);
    simpanKeStorage<ItemTugas[]>(KUNCI_STORAGE, response.data);
    daftarTugas = response.data;
    pesanAplikasi = response.message;
  } catch (error) {
    pesanAplikasi =
      error instanceof Error ? error.message : 'Tugas gagal disimpan.';
  }
  render();
}

function simpanDaftarMataKuliah(
  mataKuliah: MataKuliah[],
  pesan: string
): boolean {
  try {
    simpanKeStorage<MataKuliah[]>(KUNCI_STORAGE_JADWAL, mataKuliah);
    daftarMataKuliah = mataKuliah;
    pesanAplikasi = pesan;
    return true;
  } catch (error) {
    pesanAplikasi =
      error instanceof Error ? error.message : 'Jadwal gagal disimpan.';
    return false;
  }
}

function idMataKuliahBaru(): string {
  let suffix = Date.now();
  let id = `mata-kuliah-${suffix}`;
  while (daftarMataKuliah.some((matkul) => matkul.id === id)) {
    suffix += 1;
    id = `mata-kuliah-${suffix}`;
  }
  return id;
}

function render(): void {
  // Primitive types: hitung ulang ringkasan berdasarkan data saat ini.
  jumlahTugas = daftarTugas.length;
  const jumlahBelumSelesai = daftarTugas.filter(
    (tugas) => tugas.status === 'Belum Selesai'
  ).length;
  const jumlahSelesai = jumlahTugas - jumlahBelumSelesai;
  const totalSks = daftarMataKuliah.reduce(
    (total, matkul) => total + matkul.sks,
    0
  );
  const tugasEdit = daftarTugas.find((tugas) => tugas.id === idTugasEdit);
  const jadwalEdit = daftarMataKuliah.find(
    (matkul) => matkul.id === idJadwalEdit
  );
  const namaAman = escapeHTML(appName);
  const versiAman = escapeHTML(appVersion);

  const opsiMataKuliah = daftarMataKuliah
    .map(
      (matkul) =>
        `<option value="${escapeHTML(matkul.nama)}" ${
          tugasEdit?.matkul === matkul.nama ? 'selected' : ''
        }>${escapeHTML(matkul.nama)}</option>`
    )
    .join('');
  const opsiMatkulEditTerhapus =
    tugasEdit &&
    !daftarMataKuliah.some((matkul) => matkul.nama === tugasEdit.matkul)
      ? `<option value="${escapeHTML(tugasEdit.matkul)}" selected>${escapeHTML(tugasEdit.matkul)} (tidak ada di jadwal)</option>`
      : '';
  const daftarNamaMatkulFilter = [
    ...new Set([
      ...daftarMataKuliah.map((matkul) => matkul.nama),
      ...daftarTugas.map((tugas) => tugas.matkul)
    ])
  ];
  const daftarHariFilter = HARI_KULIAH;
  const tugasTersaring = daftarTugas.filter((tugas) => {
    const matkulJadwal = daftarMataKuliah.find(
      (matkul) => matkul.nama === tugas.matkul
    );
    const cocokMatkul = !filterMatkul || tugas.matkul === filterMatkul;
    const cocokHari =
      !filterHari || (matkulJadwal?.hari ?? 'Belum Diatur') === filterHari;
    return cocokMatkul && cocokHari;
  });

  root.innerHTML = `
    <div class="page-shell">
      <header class="site-header">
        <a class="brand" href="./" aria-label="${namaAman}, beranda">
          <span class="brand-mark" aria-hidden="true">T</span>
          <span>${namaAman}</span>
        </a>
        <span class="version-badge">Versi ${versiAman}</span>
      </header>

      <main>
        <section class="intro" aria-labelledby="page-title">
          <p class="eyebrow">RUANG KERJA AKADEMIK</p>
          <h1 id="page-title">Jadwal kuliah, lebih rapi.</h1>
          <p class="intro-copy">Catat tenggat, pantau progres, dan selesaikan satu per satu.</p>
        </section>

        <section class="stats-grid" aria-label="Ringkasan tugas">
          <article class="stat-card">
            <span class="stat-label">Total tugas</span>
            <strong class="stat-value">${jumlahTugas}</strong>
            <span class="stat-note">semua tugas tercatat</span>
          </article>
          <article class="stat-card stat-card-pending">
            <span class="stat-label">Belum selesai</span>
            <strong class="stat-value">${jumlahBelumSelesai}</strong>
            <span class="stat-note">masih perlu dikerjakan</span>
          </article>
          <article class="stat-card stat-card-done">
            <span class="stat-label">Selesai</span>
            <strong class="stat-value">${jumlahSelesai}</strong>
            <span class="stat-note">progres yang sudah dicapai</span>
          </article>
        </section>

        <section class="panel form-panel" aria-labelledby="form-title">
          <div class="section-heading">
            <div>
              <p class="eyebrow">${sedangEdit ? 'PERBARUI CATATAN' : 'TAMBAHKAN CATATAN'}</p>
              <h2 id="form-title">${sedangEdit ? 'Edit tugas' : 'Tugas baru'}</h2>
            </div>
            <span class="section-icon" aria-hidden="true">${sedangEdit ? '↗' : '+'}</span>
          </div>
          <form id="form-tugas">
            <div class="form-grid">
              <label class="field">
                <span>Mata kuliah</span>
                <select name="matkul" required>
                  <option value="">Pilih mata kuliah</option>
                  ${opsiMataKuliah}
                  ${opsiMatkulEditTerhapus}
                </select>
                ${
                  daftarMataKuliah.length === 0
                    ? '<small class="field-hint">Tambahkan mata kuliah pada bagian Jadwal Mata Kuliah terlebih dahulu.</small>'
                    : ''
                }
              </label>
              <label class="field">
                <span>Judul tugas</span>
                <input name="judul" type="text" placeholder="Contoh: Proyek akhir" maxlength="150" required value="${escapeHTML(tugasEdit?.judul ?? '')}">
              </label>
              <label class="field">
                <span>Tenggat waktu</span>
                <input name="deadline" type="date" required value="${escapeHTML(tugasEdit?.deadline ?? '')}">
              </label>
              <label class="field">
                <span>Status</span>
                <select name="status" required>
                  <option value="Belum Selesai" ${tugasEdit?.status !== 'Selesai' ? 'selected' : ''}>Belum Selesai</option>
                  <option value="Selesai" ${tugasEdit?.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                </select>
              </label>
            </div>
            <div class="form-actions">
              <button class="button button-primary" type="submit">${sedangEdit ? 'Simpan Perubahan' : 'Tambah Tugas'}</button>
              ${sedangEdit ? '<button class="button button-secondary" type="button" data-action="cancel-edit">Batal</button>' : ''}
            </div>
          </form>
        </section>

        ${pesanAplikasi ? `<p class="app-message" role="status">${escapeHTML(pesanAplikasi)}</p>` : ''}

        <section class="schedule-section" aria-labelledby="schedule-title">
          <div class="section-heading schedule-heading">
            <div>
              <p class="eyebrow">RENCANA PERKULIAHAN</p>
              <h2 id="schedule-title">Jadwal Mata Kuliah</h2>
              <p class="section-subtitle">${daftarMataKuliah.length} mata kuliah terdaftar</p>
            </div>
            <div class="total-sks"><strong>${totalSks}</strong><span>Total SKS</span></div>
          </div>

          <form id="form-jadwal" class="panel schedule-form">
            <div class="schedule-form-heading">
              <h3>${sedangEditJadwal ? 'Edit mata kuliah' : 'Tambah mata kuliah'}</h3>
              ${sedangEditJadwal ? '<button class="text-button" type="button" data-action="cancel-schedule-edit">Batal</button>' : ''}
            </div>
            <div class="schedule-form-grid">
              <label class="field">
                <span>Nama mata kuliah</span>
                <input name="nama" type="text" maxlength="100" placeholder="Contoh: Pemrograman Web" required value="${escapeHTML(jadwalEdit?.nama ?? '')}">
              </label>
              <label class="field">
                <span>SKS</span>
                <input name="sks" type="number" min="1" max="24" step="1" required value="${jadwalEdit?.sks ?? 3}">
              </label>
              <label class="field">
                <span>Hari</span>
                <select name="hari" required>
                  ${HARI_KULIAH.map(
                    (hari) =>
                      `<option value="${hari}" ${
                        jadwalEdit?.hari === hari ||
                        (!jadwalEdit && hari === 'Belum Diatur')
                          ? 'selected'
                          : ''
                      }>${hari}</option>`
                  ).join('')}
                </select>
              </label>
              <label class="field">
                <span>Jam kuliah</span>
                <input name="jam" type="text" maxlength="50" placeholder="Contoh: 08:00–10:30" required value="${escapeHTML(jadwalEdit?.jam ?? '')}">
              </label>
              <label class="field">
                <span>Ruangan</span>
                <input name="ruangan" type="text" maxlength="80" placeholder="Contoh: Gedung A, 201" required value="${escapeHTML(jadwalEdit?.ruangan ?? '')}">
              </label>
              <label class="field field-checkbox">
                <span>Jenis mata kuliah</span>
                <span class="checkbox-control">
                  <input name="wajib" type="checkbox" ${jadwalEdit?.wajib ?? true ? 'checked' : ''}>
                  Mata kuliah wajib
                </span>
              </label>
            </div>
            <div class="form-actions">
              <button class="button button-primary" type="submit">${sedangEditJadwal ? 'Simpan Jadwal' : 'Tambah Mata Kuliah'}</button>
            </div>
          </form>

          <div class="schedule-table-wrap">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th scope="col">Nama Mata Kuliah</th>
                  <th scope="col">SKS</th>
                  <th scope="col">Hari</th>
                  <th scope="col">Jam</th>
                  <th scope="col">Ruangan</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${
                  daftarMataKuliah.length === 0
                    ? '<tr><td class="schedule-empty" colspan="6">Belum ada mata kuliah. Tambahkan melalui formulir di atas.</td></tr>'
                    : daftarMataKuliah
                        .map(
                          (matkul) => `
                          <tr>
                            <td data-label="Nama Mata Kuliah">
                              <span class="schedule-course-name">${escapeHTML(matkul.nama)}</span>
                              <span class="course-type">${matkul.wajib ? 'Wajib' : 'Pilihan'}</span>
                            </td>
                            <td data-label="SKS">${matkul.sks} SKS</td>
                            <td data-label="Hari">${escapeHTML(matkul.hari)}</td>
                            <td data-label="Jam">${escapeHTML(matkul.jam)}</td>
                            <td data-label="Ruangan">${escapeHTML(matkul.ruangan)}</td>
                            <td data-label="Aksi" class="schedule-actions">
                              <button class="text-button" type="button" data-action="edit-schedule" data-id="${escapeHTML(matkul.id)}">Edit</button>
                              <button class="text-button text-button-danger" type="button" data-action="delete-schedule" data-id="${escapeHTML(matkul.id)}">Hapus</button>
                            </td>
                          </tr>
                        `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </section>

        <section class="task-section" aria-labelledby="list-title">
          <div class="section-heading list-heading">
            <div>
              <p class="eyebrow">DAFTAR PEKERJAAN</p>
              <h2 id="list-title">Daftar Tugas <span class="title-count">${tugasTersaring.length}</span></h2>
              <p class="section-subtitle">Menampilkan ${tugasTersaring.length} dari ${jumlahTugas} tugas</p>
            </div>
            <div class="task-filters">
              <label class="filter-field">
                <span>Mata kuliah</span>
                <select id="filter-matkul" aria-label="Filter tugas berdasarkan mata kuliah">
                  <option value="">Semua mata kuliah</option>
                  ${daftarNamaMatkulFilter
                    .map(
                      (nama) =>
                        `<option value="${escapeHTML(nama)}" ${
                          filterMatkul === nama ? 'selected' : ''
                        }>${escapeHTML(nama)}</option>`
                    )
                    .join('')}
                </select>
              </label>
              <label class="filter-field">
                <span>Hari</span>
                <select id="filter-hari" aria-label="Filter tugas berdasarkan hari kuliah">
                  <option value="">Semua hari</option>
                  ${daftarHariFilter
                    .map(
                      (hari) =>
                        `<option value="${hari}" ${
                          filterHari === hari ? 'selected' : ''
                        }>${hari}</option>`
                    )
                    .join('')}
                </select>
              </label>
            </div>
          </div>
          ${
            tugasTersaring.length === 0
              ? `<div class="empty-state"><span class="empty-icon" aria-hidden="true">✓</span><h3>${jumlahTugas === 0 ? 'Belum ada tugas' : 'Tidak ada tugas yang cocok'}</h3><p>${jumlahTugas === 0 ? 'Tambahkan tugas pertama untuk mulai mengatur kegiatan kuliahmu.' : 'Ubah atau bersihkan filter untuk melihat tugas lainnya.'}</p></div>`
              : `<ul class="task-list">${tugasTersaring
                  .map((tugas) => {
                    const selesai = tugas.status === 'Selesai';
                    const terlambat =
                      !selesai && tugas.deadline < tanggalHariIni();
                    return `
                      <li class="task-card ${selesai ? 'task-completed' : ''}">
                        <div class="task-main">
                          <div class="task-copy">
                            <span class="task-course">${escapeHTML(tugas.matkul)}</span>
                            <h3>${escapeHTML(tugas.judul)}</h3>
                            <span class="task-deadline ${terlambat ? 'deadline-late' : ''}">
                              <span aria-hidden="true">${terlambat ? '!' : '◷'}</span>
                              Tenggat ${escapeHTML(formatTanggal(tugas.deadline))}
                              ${terlambat ? '<strong class="late-label">Terlambat</strong>' : ''}
                            </span>
                          </div>
                          <button
                            class="status-badge ${selesai ? 'status-done' : 'status-pending'}"
                            type="button"
                            data-action="toggle-status"
                            data-id="${tugas.id}"
                            aria-pressed="${selesai}"
                            aria-label="Ubah status tugas ${escapeHTML(tugas.judul)}"
                          >${escapeHTML(tugas.status)}</button>
                        </div>
                        <div class="task-actions">
                          <button class="text-button" type="button" data-action="edit-task" data-id="${tugas.id}">Edit</button>
                          <button class="text-button text-button-danger" type="button" data-action="delete-task" data-id="${tugas.id}">Hapus</button>
                        </div>
                      </li>
                    `;
                  })
                  .join('')}</ul>`
          }
        </section>

        <section class="about-section" aria-labelledby="about-title">
          <p class="eyebrow">CATATAN PEMBELAJARAN</p>
          <h2 id="about-title">Tentang Proyek Ini</h2>
          <div class="about-grid">
            <article>
              <h3>Alat dan lingkungan</h3>
              <p><strong>Git</strong> mencatat perubahan kode dan membantu pengelolaan versi. <strong>npm</strong> mengelola paket serta menjalankan perintah proyek. <strong>TypeScript</strong> menambahkan pemeriksaan tipe pada JavaScript, sedangkan <strong>Vite</strong> menyediakan server pengembangan dan proses build. Environment variables pada <code>.env</code> menyimpan konfigurasi non-rahasia; prefix <code>VITE_</code> membuat nilainya tersedia di antarmuka, jadi jangan simpan rahasia di sana.</p>
            </article>
            <article>
              <h3>Konfigurasi dan versi</h3>
              <p><code>package.json</code> mencatat metadata, paket, dan npm scripts: <code>dev</code> untuk pengembangan, <code>build</code> untuk pemeriksaan tipe dan produksi, serta <code>preview</code> untuk melihat hasil build. <strong>dependencies</strong> dibutuhkan saat aplikasi berjalan, sementara <strong>devDependencies</strong> membantu pengembangan dan build—Vite serta TypeScript tercatat sebagai devDependencies. Dalam semantic versioning, <code>^8.3.6</code> mengizinkan pembaruan kompatibel di bawah versi mayor 9, sedangkan <code>~7.0.2</code> mengizinkan pembaruan patch di bawah 7.1.0.</p>
            </article>
            <article>
              <h3>Dari TypeScript ke website</h3>
              <p><strong>Compiler</strong> <code>tsc</code> memeriksa tipe (dengan <code>noEmit</code>, tanpa menghasilkan berkas). <strong>Transpiler</strong> mengubah sintaks TypeScript menjadi JavaScript yang dapat dijalankan browser. <strong>Bundler</strong> menelusuri dan menggabungkan modul serta aset menjadi berkas produksi di folder <code>dist</code>.</p>
            </article>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <span>${namaAman} <span class="footer-version">v${versiAman}</span></span>
        <span>Dibuat untuk membantu mengelola tugas kuliah.</span>
      </footer>
    </div>
  `;
}

// Event delegation: semua submit form tugas dan jadwal ditangani dari root.
root.addEventListener('submit', (event: SubmitEvent) => {
  if (!(event.target instanceof HTMLFormElement)) {
    return;
  }
  event.preventDefault();

  const formData = new FormData(event.target);
  if (event.target.id === 'form-tugas') {
    const judulValue = formData.get('judul');
    const matkulValue = formData.get('matkul');
    const deadlineValue = formData.get('deadline');
    const statusValue = formData.get('status');

    if (
      typeof judulValue !== 'string' ||
      typeof matkulValue !== 'string' ||
      typeof deadlineValue !== 'string' ||
      typeof statusValue !== 'string' ||
      !isStatusTugas(statusValue)
    ) {
      pesanAplikasi = 'Mohon isi semua kolom dengan data yang valid.';
      render();
      return;
    }

    const judul = judulValue.trim();
    const matkul = matkulValue.trim();
    if (
      !judul ||
      !matkul ||
      !deadlineValue ||
      (!daftarMataKuliah.some((item) => item.nama === matkul) &&
        !(sedangEdit && tugasEditMasihAdaMatkul(matkul)))
    ) {
      pesanAplikasi = 'Pilih mata kuliah terdaftar dan isi semua kolom.';
      render();
      return;
    }

    if (sedangEdit && idTugasEdit !== null) {
      const tugasDiperbarui: ItemTugas[] = daftarTugas.map((tugas) =>
        tugas.id === idTugasEdit
          ? { ...tugas, judul, matkul, deadline: deadlineValue, status: statusValue }
          : tugas
      );
      if (simpanTugasTanpaRender(tugasDiperbarui, 'Perubahan tugas berhasil disimpan.')) {
        sedangEdit = false;
        idTugasEdit = null;
      }
      render();
      return;
    }

    let idBaru = Date.now();
    while (daftarTugas.some((tugas) => tugas.id === idBaru)) {
      idBaru += 1;
    }
    const tugasBaru: ItemTugas = {
      id: idBaru,
      judul,
      matkul,
      deadline: deadlineValue,
      status: statusValue
    };
    simpanDaftarTugas([...daftarTugas, tugasBaru], 'Tugas baru berhasil ditambahkan.');
    return;
  }

  if (event.target.id === 'form-jadwal') {
    const namaValue = formData.get('nama');
    const sksValue = formData.get('sks');
    const hariValue = formData.get('hari');
    const jamValue = formData.get('jam');
    const ruanganValue = formData.get('ruangan');

    if (
      typeof namaValue !== 'string' ||
      typeof sksValue !== 'string' ||
      typeof hariValue !== 'string' ||
      typeof jamValue !== 'string' ||
      typeof ruanganValue !== 'string' ||
      !isHariKuliah(hariValue)
    ) {
      pesanAplikasi = 'Mohon isi detail jadwal dengan data yang valid.';
      render();
      return;
    }

    const nama = namaValue.trim();
    const sks = Number(sksValue);
    const jam = jamValue.trim();
    const ruangan = ruanganValue.trim();
    const namaDuplikat = daftarMataKuliah.some(
      (matkul) =>
        matkul.nama.toLocaleLowerCase('id-ID') ===
          nama.toLocaleLowerCase('id-ID') &&
        matkul.id !== idJadwalEdit
    );

    if (
      !nama ||
      !Number.isInteger(sks) ||
      sks < 1 ||
      sks > 24 ||
      !jam ||
      !ruangan ||
      namaDuplikat
    ) {
      pesanAplikasi = namaDuplikat
        ? 'Nama mata kuliah tersebut sudah ada.'
        : 'Isi nama, SKS (1–24), jam, dan ruangan dengan benar.';
      render();
      return;
    }

    const wajib = formData.get('wajib') === 'on';
    const matkulSebelumnya = sedangEditJadwal
      ? daftarMataKuliah.find((matkul) => matkul.id === idJadwalEdit)
      : undefined;
    const matkulBaru: MataKuliah = {
      id: idJadwalEdit ?? idMataKuliahBaru(),
      nama,
      sks,
      hari: hariValue,
      jam,
      ruangan,
      wajib
    };
    const jadwalBerikutnya = sedangEditJadwal
      ? daftarMataKuliah.map((matkul) =>
          matkul.id === idJadwalEdit ? matkulBaru : matkul
        )
      : [...daftarMataKuliah, matkulBaru];

    if (
      simpanDaftarMataKuliah(
        jadwalBerikutnya,
        sedangEditJadwal
          ? 'Jadwal mata kuliah berhasil diperbarui.'
          : 'Mata kuliah berhasil ditambahkan.'
      )
    ) {
      if (matkulSebelumnya && matkulSebelumnya.nama !== matkulBaru.nama) {
        if (filterMatkul === matkulSebelumnya.nama) {
          filterMatkul = matkulBaru.nama;
        }
        const tugasTerkait = daftarTugas.filter(
          (tugas) => tugas.matkul === matkulSebelumnya.nama
        );
        if (tugasTerkait.length > 0) {
          const tugasDiperbarui = daftarTugas.map((tugas) =>
            tugas.matkul === matkulSebelumnya.nama
              ? { ...tugas, matkul: matkulBaru.nama }
              : tugas
          );
          simpanTugasTanpaRender(
            tugasDiperbarui,
            'Nama mata kuliah pada tugas terkait ikut diperbarui.'
          );
        }
      }
      sedangEditJadwal = false;
      idJadwalEdit = null;
    }
    render();
  }
});

function tugasEditMasihAdaMatkul(nama: string): boolean {
  return daftarTugas.some(
    (tugas) => tugas.id === idTugasEdit && tugas.matkul === nama
  );
}

function simpanTugasTanpaRender(tugas: ItemTugas[], pesan: string): boolean {
  try {
    const response = bungkusResponse(tugas, pesan);
    simpanKeStorage<ItemTugas[]>(KUNCI_STORAGE, response.data);
    daftarTugas = response.data;
    pesanAplikasi = response.message;
    return true;
  } catch (error) {
    pesanAplikasi =
      error instanceof Error ? error.message : 'Tugas gagal disimpan.';
    return false;
  }
}

// Event delegation: perubahan filter dan seluruh aksi tombol ditangani di root.
root.addEventListener('change', (event: Event) => {
  if (!(event.target instanceof HTMLSelectElement)) {
    return;
  }

  if (event.target.id === 'filter-matkul') {
    filterMatkul = event.target.value;
    render();
  } else if (event.target.id === 'filter-hari') {
    const value = event.target.value;
    filterHari = value === '' || isHariKuliah(value) ? value : '';
    render();
  }
});

root.addEventListener('click', (event: MouseEvent) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest<HTMLButtonElement>('button[data-action]');
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === 'cancel-edit') {
    sedangEdit = false;
    idTugasEdit = null;
    pesanAplikasi = '';
    render();
    return;
  }

  if (action === 'cancel-schedule-edit') {
    sedangEditJadwal = false;
    idJadwalEdit = null;
    pesanAplikasi = '';
    render();
    return;
  }

  if (action === 'edit-task' || action === 'toggle-status' || action === 'delete-task') {
    const idTugas = Number(id);
    if (!Number.isSafeInteger(idTugas)) {
      return;
    }
    const tugas = daftarTugas.find((item) => item.id === idTugas);
    if (!tugas) {
      return;
    }

    if (action === 'edit-task') {
      sedangEdit = true;
      idTugasEdit = idTugas;
      pesanAplikasi = '';
      render();
      root.querySelector<HTMLSelectElement>('select[name="matkul"]')?.focus();
    } else if (action === 'toggle-status') {
      const statusBaru: StatusTugas =
        tugas.status === 'Selesai' ? 'Belum Selesai' : 'Selesai';
      const tugasDiperbarui = daftarTugas.map((item) =>
        item.id === idTugas ? { ...item, status: statusBaru } : item
      );
      simpanDaftarTugas(tugasDiperbarui, 'Status tugas berhasil diperbarui.');
    } else if (
      window.confirm(`Hapus tugas "${tugas.judul}"?`)
    ) {
      const tugasTersisa = daftarTugas.filter((item) => item.id !== idTugas);
      if (idTugasEdit === idTugas) {
        sedangEdit = false;
        idTugasEdit = null;
      }
      simpanDaftarTugas(tugasTersisa, 'Tugas berhasil dihapus.');
    }
    return;
  }

  if (
    action === 'edit-schedule' ||
    action === 'delete-schedule'
  ) {
    if (!id) {
      return;
    }
    const matkul = daftarMataKuliah.find((item) => item.id === id);
    if (!matkul) {
      return;
    }

    if (action === 'edit-schedule') {
      sedangEditJadwal = true;
      idJadwalEdit = id;
      pesanAplikasi = '';
      render();
      root.querySelector<HTMLInputElement>('input[name="nama"]')?.focus();
    } else if (
      window.confirm(
        `Hapus "${matkul.nama}" dari jadwal? Tugas yang sudah memakai mata kuliah ini tetap tersimpan.`
      )
    ) {
      const jadwalBerikutnya = daftarMataKuliah.filter(
        (item) => item.id !== id
      );
      if (simpanDaftarMataKuliah(jadwalBerikutnya, 'Mata kuliah berhasil dihapus.')) {
        if (idJadwalEdit === id) {
          sedangEditJadwal = false;
          idJadwalEdit = null;
        }
      }
      render();
    }
  }
});

render();
