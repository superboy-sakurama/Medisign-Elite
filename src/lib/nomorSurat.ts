import { supabase } from './supabase';

export async function generateNomorSurat(jenisSurat: string): Promise<{ no_urut: number; nomor_surat_full: string }> {
  try {
    const currentYear = new Date().getFullYear();
    const currentYearStr = currentYear.toString();
    
    // Cek tabel surat_keterangan untuk mendapatkan nomor surat terakhir pada tahun berjalan
    const { data, error } = await supabase
      .from('surat_keterangan')
      .select('nomor_surat')
      .gte('tanggal_terbit', `${currentYear}-01-01`)
      .lte('tanggal_terbit', `${currentYear}-12-31`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching latest nomor_surat:', error);
    }

    // Jika belum ada set 1, jika ada MAX + 1
    let nextNoUrut = 1;
    if (data && data.nomor_surat) {
      // Format baku: 400.7.22.1 / [nomor_urut_5_digit] / [jenis_surat] / 413.102.5.8 / [tahun_berjalan]
       const parts = data.nomor_surat.split('/');
       if (parts.length > 1) {
          const urut = parseInt(parts[1], 10);
          if (!isNaN(urut)) {
             nextNoUrut = urut + 1;
          }
       }
    }

    // Format menjadi 5 digit padStart 
    const paddedNoUrut = nextNoUrut.toString().padStart(5, '0');
    
    // Format baku: 400.7.22.1 / [nomor_urut_5_digit] / [jenis_surat] / 413.102.5.8 / [tahun_berjalan]
    const nomor_surat_full = `400.7.22.1/${paddedNoUrut}/${jenisSurat}/413.102.5.8/${currentYearStr}`;

    return { no_urut: nextNoUrut, nomor_surat_full };
  } catch (err) {
    console.error('Failed to generate nomor surat', err);
    // Fallback jika terjadi error
    return {
      no_urut: 1,
      nomor_surat_full: `400.7.22.1/00001/${jenisSurat}/413.102.5.8/${new Date().getFullYear()}`
    };
  }
}
