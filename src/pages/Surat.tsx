import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientSearch, PatientData } from '@/components/PatientSearch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// PDF Generator dependencies
import { pdf } from '@react-pdf/renderer';
import { SuratPDF } from '@/components/SuratPDF';

export default function FormSurat() {
  const { jenis_surat } = useParams<{ jenis_surat: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  
  // Data Klinis State (using any for simplicity across different forms in this demo)
  const [dataKlinis, setDataKlinis] = useState<any>({});
  
  // For saving simulation
  const [isSaving, setIsSaving] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);

  const handlePatientSelect = (p: PatientData | null) => {
    setPatient(p);
  };

  const handleClinicalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setDataKlinis({ ...dataKlinis, [e.target.name]: e.target.value });
  };

  const currentSuratType = jenis_surat?.toUpperCase() || '';

  const renderDiagnosticForm = () => {
    switch (currentSuratType) {
      case 'SKI':
        return (
          <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tensi (mmHg)</Label>
                  <Input name="tensi" placeholder="120/80" onChange={handleClinicalChange} />
                </div>
                <div className="space-y-2">
                  <Label>Suhu (°C)</Label>
                  <Input name="suhu" placeholder="36.5" onChange={handleClinicalChange} />
                </div>
                <div className="space-y-2">
                  <Label>Nadi (x/mnt)</Label>
                  <Input name="nadi" placeholder="80" onChange={handleClinicalChange} />
                </div>
             </div>
             <div className="space-y-2">
                <Label>Diagnosa</Label>
                <Input name="diagnosa" placeholder="Gejala Typus / Ispa..." onChange={handleClinicalChange} />
             </div>
             <div className="space-y-2">
                <Label>Terapy</Label>
                <textarea 
                  name="terapy" 
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Obat-obatan yang diberikan..." 
                  onChange={handleClinicalChange as any} 
                />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
                <div className="space-y-2">
                  <Label>Lama Istirahat (Hari)</Label>
                  <Input type="number" name="lama_hari" placeholder="3" onChange={handleClinicalChange} />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input type="date" name="tgl_mulai" onChange={handleClinicalChange} />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Input type="date" name="tgl_selesai" onChange={handleClinicalChange} />
                </div>
             </div>
          </div>
        );
      case 'SKBN':
        return (
          <div className="space-y-6">
             <div className="space-y-2">
                <Label>Keperluan</Label>
                <Input name="keperluan" placeholder="Melamar Pekerjaan / Masuk Perguruan Tinggi" onChange={handleClinicalChange} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tinggi Badan (cm)</Label>
                  <Input type="number" name="tinggi_badan" placeholder="170" onChange={handleClinicalChange} />
                </div>
                <div className="space-y-2">
                  <Label>Berat Badan (kg)</Label>
                  <Input type="number" name="berat_badan" placeholder="65" onChange={handleClinicalChange} />
                </div>
             </div>
             <div>
                <Label className="text-base font-semibold mb-3 block border-b pb-2">Drugs Urine Test (Parameter LAB)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['mop', 'coc', 'thc', 'amp', 'met', 'bzo'].map(param => (
                    <div key={param} className="space-y-2">
                      <Label className="uppercase">{param}</Label>
                      <select 
                        name={`hasil_${param}`} 
                        onChange={handleClinicalChange as any}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        defaultValue="NEGATIF"
                      >
                        <option value="NEGATIF">NEGATIF</option>
                        <option value="POSITIF">POSITIF</option>
                      </select>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        );
      default:
        return <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">Form untuk {currentSuratType} sedang dalam pengembangan.</div>;
    }
  };

  const handleSave = async () => {
    if (!patient) {
      alert("Harap cari atau isi data pasien terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. In a real app we'd upsert patient data to supabase here if it's new
      // const { data: pData } = await supabase.from('pasien').upsert(patient).select().single();
      
      // 2. Insert surat_keterangan
      // const suratData = { jenis_surat: currentSuratType, pasien_id: pData.id, data_klinis: dataKlinis, nomor_surat: ... }
      // await supabase.from('surat_keterangan').insert(suratData)

      // 3. Generate PDF internally for printing
      // We simulate an inserted ID for the QR code verification URL
      const fakeSuratId = crypto.randomUUID();
      const fakeNomorSurat = `440/${Math.floor(Math.random() * 1000)}/413.111/${new Date().getFullYear()}`;
      
      const doc = <SuratPDF suratType={currentSuratType} patient={patient} dataKlinis={dataKlinis} suratId={fakeSuratId} nomorSurat={fakeNomorSurat} />;
      const blob = await pdf(doc).toBlob();
      
      setGeneratedPdfBlob(blob);
      
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Button>
          <h2 className="text-lg font-bold text-slate-800">Form Pembuatan {currentSuratType}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-blue-600">Terhubung ke Database</p>
          </div>
        </div>
      </header>
      
      <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-6">
          <PatientSearch onPatientSelect={handlePatientSelect} />

          {/* Patient Identity Form - Pre-filled if patient found, editable if new */}
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-800">Identitas Pasien</CardTitle>
              <CardDescription className="text-xs text-slate-400">Data demografis pasien terintegrasi NIK.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-600 uppercase">NAMA LENGKAP</Label>
                    <Input value={patient?.nama || ''} onChange={(e) => setPatient(prev => ({...prev, nama: e.target.value} as any))} className="bg-slate-50 border-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-600 uppercase">NIK</Label>
                    <Input value={patient?.nik || ''} onChange={(e) => setPatient(prev => ({...prev, nik: e.target.value} as any))} className="bg-slate-50 border-slate-300 font-mono text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600 uppercase">Tempat Lahir</Label>
                      <Input value={patient?.tempat_lahir || ''} onChange={(e) => setPatient(prev => ({...prev, tempat_lahir: e.target.value} as any))} className="bg-slate-50 border-slate-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600 uppercase">Tgl Lahir</Label>
                      <Input type="date" value={patient?.tanggal_lahir || ''} onChange={(e) => setPatient(prev => ({...prev, tanggal_lahir: e.target.value} as any))} className="bg-slate-50 border-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-600 uppercase">Pekerjaan</Label>
                    <Input value={patient?.pekerjaan || ''} onChange={(e) => setPatient(prev => ({...prev, pekerjaan: e.target.value} as any))} className="bg-slate-50 border-slate-300" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-600 uppercase">Alamat Lengkap</Label>
                    <Input value={patient?.alamat || ''} onChange={(e) => setPatient(prev => ({...prev, alamat: e.target.value} as any))} className="bg-slate-50 border-slate-300" />
                  </div>
                </div>
            </CardContent>
          </Card>

          {/* Clinical Data Form */}
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-800">Data Klinis & Pemeriksaan</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {renderDiagnosticForm()}
            </CardContent>
          </Card>

          <div className="flex gap-4 items-center justify-end border-t border-slate-200 pt-6">
            <button className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200" onClick={() => navigate('/dashboard')}>Batal</button>
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Simpan & Generate Dokumen
                </>
              )}
            </button>
          </div>

          {generatedPdfBlob && (
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-8 flex flex-col items-center text-center space-y-4 shadow-sm mt-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Printer className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Dokumen Siap Dicetak</h3>
                <p className="text-slate-600 text-sm">Surat Keterangan {currentSuratType} telah diterbitkan dengan QR Code verifikasi resmi.</p>
                <button className="px-6 py-3 bg-white border border-slate-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-slate-50 shadow-sm" onClick={() => window.open(URL.createObjectURL(generatedPdfBlob), '_blank')}>
                  Pratinjau & Cetak PDF
                </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
