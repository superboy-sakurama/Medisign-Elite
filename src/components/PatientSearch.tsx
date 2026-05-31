import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Loader2 } from 'lucide-react';

export interface PatientData {
  id?: string;
  nik: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama: string;
  pekerjaan: string;
  alamat: string;
  no_hp: string;
  golongan_darah: string;
}

interface PatientSearchProps {
  onPatientSelect: (patient: PatientData | null) => void;
}

export function PatientSearch({ onPatientSelect }: PatientSearchProps) {
  const [nikSearch, setNikSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchPatient = async () => {
    if (!nikSearch) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('pasien')
        .select('*')
        .eq('nik', nikSearch)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          setError('Pasien tidak ditemukan. Silakan daftarkan pasien baru.');
          onPatientSelect(null); // Clear selected to show empty form
        } else {
          setError(error.message);
        }
      } else if (data) {
        setError('');
        onPatientSelect(data as PatientData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 w-full">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 font-medium" 
            placeholder="Cari NIK Pasien (Contoh: 3524010000000001)..."
            value={nikSearch}
            onChange={(e) => setNikSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchPatient()}
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button 
            onClick={searchPatient} 
            disabled={loading || !nikSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none flex items-center justify-center min-w-[140px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cari & Autofill'}
          </button>
          <button 
            onClick={() => onPatientSelect(null)}
            className="px-4 py-3 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-200 whitespace-nowrap"
          >
            + Pasien Baru
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-4 text-sm font-medium text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">{error}</p>
      )}
    </section>
  );
}
