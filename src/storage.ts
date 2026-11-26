// Generics: simpan nilai bertipe apa pun sebagai JSON di LocalStorage.
export function simpanKeStorage<T>(kunci: string, nilai: T): void {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai));
  } catch (error) {
    console.error('Gagal menyimpan data ke LocalStorage.', error);
    throw new Error('Data tugas gagal disimpan. Periksa ruang penyimpanan browser.');
  }
}

// Generics: muat dan parse data, atau lemparkan error agar kegagalan terlihat.
export function muatDariStorage<T>(kunci: string, cadangan: T): T {
  try {
    const nilai = localStorage.getItem(kunci);
    return nilai === null ? cadangan : (JSON.parse(nilai) as T);
  } catch (error) {
    console.error('Gagal memuat data dari LocalStorage.', error);
    throw new Error('Data tugas gagal dimuat dari penyimpanan browser.');
  }
}
