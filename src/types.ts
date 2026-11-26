// 1. Primitive types, Type Alias, & Union type
export type StatusTugas = 'Belum Selesai' | 'Selesai';
export type Matkul = string;

// Type alias dan union type: hari yang dapat dipilih untuk jadwal kuliah.
export type HariKuliah =
  | 'Senin'
  | 'Selasa'
  | 'Rabu'
  | 'Kamis'
  | 'Jumat'
  | 'Sabtu'
  | 'Belum Diatur';

// Interface: detail mata kuliah menggunakan tipe data eksplisit.
export interface MataKuliah {
  id: string;
  nama: string;
  sks: number;
  hari: HariKuliah;
  jam: string;
  ruangan: string;
  wajib: boolean;
}

// Array: delapan mata kuliah default dengan total 24 SKS.
export const JADWAL_MATA_KULIAH_DEFAULT: MataKuliah[] = [
  { id: 'aljabar-linier', nama: 'Aljabar Linier', sks: 3, hari: 'Belum Diatur', jam: 'Belum Diatur', ruangan: 'Belum Diatur', wajib: true },
  { id: 'manajemen-basis-data', nama: 'Manajemen Basis Data', sks: 3, hari: 'Belum Diatur', jam: 'Belum Diatur', ruangan: 'Belum Diatur', wajib: true },
  { id: 'jaringan-komputer', nama: 'Jaringan Komputer', sks: 3, hari: 'Belum Diatur', jam: 'Belum Diatur', ruangan: 'Belum Diatur', wajib: true },
  { id: 'pengembangan-aplikasi-mobile', nama: 'Pengembangan Aplikasi Mobile', sks: 3, hari: 'Belum Diatur', jam: 'Belum Diatur', ruangan: 'Belum Diatur', wajib: true },
  { id: 'pengembangan-aplikasi-web', nama: 'Pengembangan Aplikasi Web', sks: 3, hari: 'Belum Diatur', jam: 'Belum Diatur', ruangan: 'Belum Diatur', wajib: true },
  { id: 'interaksi-manusia-komputer', nama: 'Interaksi Manusia dan Komputer', sks: 3, hari: 'Belum Diatur', jam: 'Belum Diatur', ruangan: 'Belum Diatur', wajib: true },
  { id: 'intelegensia-buatan', nama: 'Intelegensia Buatan', sks: 3, hari: 'Belum Diatur', jam: 'Belum Diatur', ruangan: 'Belum Diatur', wajib: true },
  { id: 'manajemen-proyek-perangkat-lunak', nama: 'Manajemen Proyek Perangkat Lunak', sks: 3, hari: 'Belum Diatur', jam: 'Belum Diatur', ruangan: 'Belum Diatur', wajib: true }
];

// 2. Interface untuk Struktur Data Tugas (Array & Primitive types)
export interface ItemTugas {
  id: number;
  judul: string;
  matkul: Matkul;
  deadline: string;
  status: StatusTugas;
}

// 3. Generics sederhana untuk Utility Response
export interface ResponseData<T> {
  success: boolean;
  data: T[];
  message: string;
}

export function bungkusResponse<T>(items: T[], msg: string): ResponseData<T> {
  return {
    success: true,
    data: items,
    message: msg
  };
}
