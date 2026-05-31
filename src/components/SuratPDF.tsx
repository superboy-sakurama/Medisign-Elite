import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { PatientData } from './PatientSearch';

// Function to generate Base64 QR code since React-PDF Image component requires a URL/Base64
// We'll generate it client side using qrcode.react in the UI, but for PDF we can use a service or pre-generate it.
// To keep it simple and robust locally, we use a public QR code generation API for the document payload, 
// OR we could just simulate it. Here we use an API that returns an image.
const getQrCodeUrl = (url: string) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;

// Logo assets
const logoPemkab = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Lambang_Kabupaten_Lamongan.png/300px-Lambang_Kabupaten_Lamongan.png';
const logoPuskesmas = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Logo_Bakti_Husada.svg/300px-Logo_Bakti_Husada.svg.png';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  headerTextContainer: { alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 3 },
  headerAddress: { fontSize: 10 },
  divider: { borderBottomWidth: 2, borderBottomColor: '#000', marginBottom: 2, marginTop: 10 },
  dividerThin: { borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 20 },
  suratTitle: { textAlign: 'center', fontSize: 14, fontWeight: 'bold', textDecoration: 'underline' },
  suratNumber: { textAlign: 'center', marginBottom: 20 },
  contentRow: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 120 },
  colon: { width: 10 },
  value: { flex: 1, fontWeight: 'bold' },
  paragraph: { marginTop: 10, marginBottom: 10, lineHeight: 1.5, textAlign: 'justify' },
  signatureSection: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
  qrContainer: { width: 80, height: 80 },
  signatureBlock: { alignItems: 'center', width: 200 },
  signatureName: { marginTop: 60, fontWeight: 'bold', textDecoration: 'underline' },
  signatureNip: { marginTop: 2 }
});

interface SuratPDFProps {
  suratType: string;
  patient: PatientData;
  dataKlinis: any;
  suratId: string;
  nomorSuratFull: string;
}

export const SuratPDF = ({ suratType, patient, dataKlinis, suratId, nomorSuratFull }: SuratPDFProps) => {
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${suratId}`;
  const qrCodeImg = getQrCodeUrl(verifyUrl);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* KOP SURAT */}
        <View style={styles.header}>
          {/* Logo Kiri */}
          <View style={{ width: 60, height: 75, justifyContent: 'center', alignItems: 'center' }}>
            <Image src={logoPemkab} style={{ width: 55, height: 65, objectFit: 'contain' }} />
          </View>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>PEMERINTAH KABUPATEN LAMONGAN</Text>
            <Text style={styles.headerTitle}>DINAS KESEHATAN</Text>
            <Text style={styles.headerSubtitle}>PUSKESMAS KALITENGAH</Text>
            <Text style={styles.headerAddress}>Jl. Raya Kalitengah No. 12, Kec. Kalitengah, Kab. Lamongan</Text>
            <Text style={styles.headerAddress}>Email: pkmkalitengah@lamongankab.go.id</Text>
          </View>

          {/* Logo Kanan */}
          <View style={{ width: 60, height: 75, justifyContent: 'center', alignItems: 'center' }}>
             <Image src={logoPuskesmas} style={{ width: 55, height: 65, objectFit: 'contain' }} />
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.dividerThin} />

        {/* JUDUL SURAT */}
        <Text style={styles.suratTitle}>
          {suratType === 'SKD' ? 'SURAT KETERANGAN DOKTER (SKD)' : 
           suratType === 'SKI' ? 'SURAT KETERANGAN ISTIRAHAT' : 
           suratType === 'SKBN' ? 'SURAT KETERANGAN BEBAS NARKOBA' : 
           suratType === 'SKB' ? 'SURAT KETERANGAN BEROBAT' :
           suratType === 'SKH' ? 'SURAT KETERANGAN HAMIL' :
           suratType === 'SKSH' ? 'SURAT KETERANGAN SEHAT HAJI' :
           suratType === 'SKV' ? 'SURAT KETERANGAN VAKSIN' :
           `SURAT KETERANGAN ${suratType}`}
        </Text>
        <Text style={styles.suratNumber}>Nomor: {nomorSuratFull}</Text>

        <Text style={{ marginBottom: 10 }}>Yang bertanda tangan di bawah ini menerangkan bahwa:</Text>
        
        {/* IDENTITAS */}
        <View style={styles.contentRow}>
          <Text style={styles.label}>Nama Lengkap</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{patient.nama}</Text>
        </View>
        <View style={styles.contentRow}>
          <Text style={styles.label}>Umur / Tgl Lahir</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{patient.tanggal_lahir}</Text>
        </View>
        <View style={styles.contentRow}>
          <Text style={styles.label}>Pekerjaan</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{patient.pekerjaan}</Text>
        </View>
        <View style={styles.contentRow}>
          <Text style={styles.label}>Alamat</Text><Text style={styles.colon}>:</Text><Text style={styles.value}>{patient.alamat}</Text>
        </View>

        {/* DATA KLINIS SPESIFIK */}
        {suratType === 'SKI' && (
          <View>
            <Text style={styles.paragraph}>
              Berdasarkan hasil pemeriksaan medis, pasien tersebut didiagnosa mengalami {dataKlinis.diagnosa || '...'}. 
              Oleh karena itu, yang bersangkutan memerlukan istirahat selama {dataKlinis.lama_hari || '...'} hari, 
              terhitung mulai tanggal {dataKlinis.tgl_mulai || '...'} sampai dengan {dataKlinis.tgl_selesai || '...'}.
            </Text>
          </View>
        )}

        {suratType === 'SKBN' && (
          <View>
            <Text style={styles.paragraph}>
              Berdasarkan pemeriksaan fisik dan uji laboratorium urin pada hari ini, dinyatakan bahwa:
            </Text>
            <View style={{ marginLeft: 20, marginBottom: 10 }}>
              <Text>MOP (Morphine) : {dataKlinis.hasil_mop || 'NEGATIF'}</Text>
              <Text>COC (Cocaine)  : {dataKlinis.hasil_coc || 'NEGATIF'}</Text>
              <Text>THC (Marijuana): {dataKlinis.hasil_thc || 'NEGATIF'}</Text>
              <Text>AMP (Amphetamine): {dataKlinis.hasil_amp || 'NEGATIF'}</Text>
              <Text>MET (Methamphetamine): {dataKlinis.hasil_met || 'NEGATIF'}</Text>
              <Text>BZO (Benzodiazepine): {dataKlinis.hasil_bzo || 'NEGATIF'}</Text>
            </View>
            <Text style={styles.paragraph}>
              Surat ini dipergunakan untuk: {dataKlinis.keperluan}
            </Text>
          </View>
        )}

        <Text style={styles.paragraph}>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</Text>

        {/* TANDA TANGAN & QR */}
        <View style={styles.signatureSection}>
          <View>
             {/* QR Code Verification */}
             <Text style={{fontSize: 8, marginBottom: 4}}>Scan untuk verifikasi keaslian dokumen:</Text>
             <Image src={qrCodeImg} style={styles.qrContainer} />
          </View>
          <View style={styles.signatureBlock}>
            <Text>Kalitengah, {new Date().toLocaleDateString('id-ID')}</Text>
            <Text>Dokter Pemeriksa,</Text>
            <Text style={styles.signatureName}>dr. R.M. Ustadho</Text>
            <Text style={styles.signatureNip}>NIP. 198502022010021002</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};
