// 1. Primitive types, Type Alias, & Union type
export type StatusTugas = 'Belum Selesai' | 'Selesai';
export type Matkul = string;

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
