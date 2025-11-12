import { Project, ProjectType, ProjectStatus } from './types';

// --- Helper Functions for Data Parsing ---

// Parses currency like "Rp. 1.234.567,00" into a number
const parseCurrency = (value: string): number => {
  if (!value || typeof value !== 'string' || value.trim() === "") {
    return 0;
  }
  const numericString = value.replace(/Rp\.\s?|,\d{2}$|\./g, '').trim();
  const number = parseFloat(numericString);
  return isNaN(number) ? 0 : number;
};

// Normalizes various status strings into the standard ProjectStatus type
const normalizeStatus = (status: string): ProjectStatus => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('selesai') || lowerStatus.includes('sudah selesai')) return 'Selesai';
  // FIX: Added 'penandatanganan' to correctly map projects in that stage.
  if (lowerStatus.includes('berjalan') || lowerStatus.includes('sedang berjalan') || lowerStatus.includes('penandatanganan')) return 'Dalam Proses';
  if (lowerStatus.includes('dibatalkan') || lowerStatus.includes('ditutup')) return 'Ditunda';
  return 'Perencanaan'; // Default for other cases
};

// Normalizes various procurement types into the standard ProjectType
const normalizeType = (type: string): ProjectType => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('swakelola')) return 'Swakelola';
    if (lowerType.includes('non') && (lowerType.includes('tender') || lowerType.includes('konstruksi'))) return 'Non-Tender';
    if (lowerType.includes('tender') || lowerType.includes('konstruksi') || lowerType.includes('konsultansi') || lowerType.includes('barang') || lowerType.includes('lainnya')) return 'Tender';
    return 'Tender'; // Default
};


// Generates plausible random coordinates within the NTB province bounding box
const generateNtbCoordinates = (): { lintang: number; bujur: number } => {
  const minLat = -9.0;    // South
  const maxLat = -8.1;    // North
  const minLng = 115.7;   // West
  const maxLng = 119.2;   // East
  const lintang = Math.random() * (maxLat - minLat) + minLat;
  const bujur = Math.random() * (maxLng - minLng) + minLng;
  return { lintang: parseFloat(lintang.toFixed(4)), bujur: parseFloat(bujur.toFixed(4)) };
};

// A small pool of generic placeholder images to add visual variety
const placeholderImages = [
    'https://i.imgur.com/8m5g2a5.jpeg',
    'https://i.imgur.com/xQfV8GZ.jpeg',
    'https://i.imgur.com/pDRgq8s.jpeg',
    'https://i.imgur.com/s6XbK3g.jpeg',
    'https://i.imgur.com/so72y52.jpeg',
];
let imageCounter = 0;
const getPlaceholderImage = (): string => {
    const imageUrl = placeholderImages[imageCounter];
    imageCounter = (imageCounter + 1) % placeholderImages.length;
    return imageUrl;
};

const robustParseCsv = (csvText: string): Record<string, string>[] => {
    const lines = csvText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const data = lines.slice(1).map(line => {
        if (!line.trim()) return null;

        const values: string[] = [];
        let currentField = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // This is an escaped quote
                    currentField += '"';
                    i++; // Skip the next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of a field
                values.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        values.push(currentField); // Add the last value

        if (values.length >= headers.length) { // Use >= to handle trailing commas
            return headers.reduce((obj, header, index) => {
                obj[header] = (values[index] || '').trim().replace(/^"|"$/g, '');
                return obj;
            }, {} as Record<string, string>);
        }
        return null;
    }).filter((row): row is Record<string, string> => row !== null);
    
    return data;
};


// --- Raw CSV Data ---

// FIX: Moved constants to the top to fix ReferenceError
const csvData1 = `"Tahun Anggaran","Kode Paket","Nama Paket","Kode RUP","K/L/PD","Nama Satker","Tipe Swakelola","Nilai Pagu","Nama Pelaksana","Nilai Total Realiasai","Sumber Dana","Status Paket"
"2025","10156782000","Belanja Pemeliharaan Bangunan Gedung-Bangunan Gedung Tempat Kerja-Bangunan Gedung Kantor","40850734","Provinsi Nusa Tenggara Barat","Unit Pelayanan Pajak Daerah Taliwang","K/L/PD Penanggung Jawab Anggaran","Rp. 37.000.000,00","CV. ABYAN NANDANA, ","Rp. 37.000.000,00","APBD","Paket Sudah Selesai"
"2025","10161149000","Belanja Perjalanan Dinas Paket Meeting Dalam Kota","41043818","Provinsi Nusa Tenggara Barat","Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu","K/L/PD Penanggung Jawab Anggaran","Rp. 56.000.000,00","PT. Senggigi Pratama Internasional (Hotel Merumatta), ","Rp. 54.500.000,00","APBD","Paket Sudah Selesai"
"2025","10144163000","Belanja Pemeliharaan Jalan dan Jembatan-Jalan-Jalan Provinsi","40829402","Provinsi Nusa Tenggara Barat","Balai Pemeliharaan Jalan Provinsi Wilayah Pulau Sumbawa Bagian Timur","K/L/PD Penanggung Jawab Anggaran","Rp. 5.179.003.000,00","IRAWAN SURIANSYAH, ","Rp. 29.762.000,00","APBD","Paket Sudah Selesai"
"2025","10113375000","Belanja Jasa Kalibrasi","39773567","Provinsi Nusa Tenggara Barat","Balai Pengujian Material Konstruksi","K/L/PD Penanggung Jawab Anggaran","Rp. 25.950.000,00","","Rp. 25.950.000,00","APBD","Paket Sudah Selesai"
"2025","10113508000","Belanja Jasa Kalibrasi","39773567","Provinsi Nusa Tenggara Barat","Balai Pengujian Material Konstruksi","K/L/PD Penanggung Jawab Anggaran","Rp. 25.950.000,00","","Rp. 25.950.000,00","APBD","Paket Dibatalkan"
"2025","10113452000","Belanja Jasa Kalibrasi","39773567","Provinsi Nusa Tenggara Barat","Balai Pengujian Material Konstruksi","K/L/PD Penanggung Jawab Anggaran","Rp. 25.950.000,00","","Rp. 25.950.000,00","APBD","Paket Dibatalkan"
"2025","10113680000","Belanja Jasa Kalibrasi","39773567","Provinsi Nusa Tenggara Barat","Balai Pengujian Material Konstruksi","K/L/PD Penanggung Jawab Anggaran","Rp. 25.950.000,00","","","APBD","Paket Sudah Selesai"
"2025","10115750000","Pemeliharaan rutin (swakelola)/rambasan DI. Santong (1807 ha)","39350513","Provinsi Nusa Tenggara Barat","Balai Pengelolaan Sumber Daya Air dan Hidrologi Wilayah Sungai Pulau Lombok","K/L/PD Penanggung Jawab Anggaran","Rp. 240.787.200,00","ROZAN FAHRIADY, ","Rp. 40.131.200,00","APBD","Paket Sudah Selesai"
"2025","10115756000","Pemeliharaan Rutin (Swakelola)/rambasan D.I. Maronggek Komplek (1.246 Ha)","39350527","Provinsi Nusa Tenggara Barat","Balai Pengelolaan Sumber Daya Air dan Hidrologi Wilayah Sungai Pulau Lombok","K/L/PD Penanggung Jawab Anggaran","Rp. 286.598.400,00","AKHMAD RIDWAN, ","Rp. 47.766.400,00","APBD","Paket Sudah Selesai"
"2025","10115716000","Pemeliharaan Rutin (Swakelola)/rambasan D.I. Belanting (1.300 Ha)","39350521","Provinsi Nusa Tenggara Barat","Balai Pengelolaan Sumber Daya Air dan Hidrologi Wilayah Sungai Pulau Lombok","K/L/PD Penanggung Jawab Anggaran","Rp. 137.395.200,00","AKHMAD RIDWAN, ","Rp. 22.899.200,00","APBD","Paket Sudah Selesai"
"2025","10115722000","Pemeliharaan Rutin (Swakelola)/rambasan D.I. Sambelia (1.656 Ha)","39350523","Provinsi Nusa Tenggara Barat","Balai Pengelolaan Sumber Daya Air dan Hidrologi Wilayah Sungai Pulau Lombok","K/L/PD Penanggung Jawab Anggaran","Rp. 190.483.200,00","AKHMAD RIDWAN, ","Rp. 31.747.200,00","APBD","Paket Sudah Selesai"
"2025","10115760000","Pemeliharaan Rutin (Swakelola)/rambasan D.I. Plapak (2.227 Ha)","39350511","Provinsi Nusa Tenggara Barat","Balai Pengelolaan Sumber Daya Air dan Hidrologi Wilayah Sungai Pulau Lombok","K/L/PD Penanggung Jawab Anggaran","Rp. 279.561.600,00","AKHMAD RIDWAN, ","Rp. 46.593.600,00","APBD","Paket Sudah Selesai"
"2025","10115761000","Pemeliharaan Rutin (Swakelola)/rambasan D.I. Sakra (1.859 Ha)","39350518","Provinsi Nusa Tenggara Barat","Balai Pengelolaan Sumber Daya Air dan Hidrologi Wilayah Sungai Pulau Lombok","K/L/PD Penanggung Jawab Anggaran","Rp. 414.470.400,00","AKHMAD RIDWAN, ","Rp. 69.078.400,00","APBD","Paket Sudah Selesai"
"2025","10115766000","Pemeliharaan Rutin (Swakelola) / rambasan D.I. Rutus Lombok Timur (2.783 Ha)","39350519","Provinsi Nusa Tenggara Barat","Balai Pengelolaan Sumber Daya Air dan Hidrologi Wilayah Sungai Pulau Lombok","K/L/PD Penanggung Jawab Anggaran","Rp. 211.185.600,00","HERMAN JUFI, ","Rp. 35.197.600,00","APBD","Paket Sudah Selesai"
"2025","10115769000","Pemeliharaan Rutin (Swakelola)/rambasan D.I. Rutus Lombok Tengah (2.783 Ha)","39350520","Provinsi Nusa Tenggara Barat","Balai Pengelolaan Sumber Daya Air dan Hidrologi Wilayah Sungai Pulau Lombok","K/L/PD Penanggung Jawab Anggaran","Rp. 198.873.600,00","HERMAN JUFI, ","Rp. 33.145.600,00","APBD","Paket Sudah Selesai"
"2025","10097782000","Belanja Tagihan Listrik","38760988","Provinsi Nusa Tenggara Barat","Balai Latihan Kerja Dalam dan Luar Negeri NTB","K/L/PD Penanggung Jawab Anggaran","Rp. 68.760.000,00","PT Pos indonesia, PT Pos indonesia, PT Pos indonesia, PT Pos Indonesia, ","Rp. 15.312.385,00","APBD","Paket Sedang Berjalan"
"2025","10097790000","Belanja Tagihan Listrik,Belanja Kawat/Faksimili/Internet/TV Berlangganan","38760988, 38760989","Provinsi Nusa Tenggara Barat","Balai Latihan Kerja Dalam dan Luar Negeri NTB","K/L/PD Penanggung Jawab Anggaran","Rp. 98.760.000,00","PT Pos indonesia, PT Pos indonesia, PT Pos indonesia, PT Pos indonesia, ","Rp. 9.661.547,00","APBD","Paket Sedang Berjalan"`;

const csvData2 = `"Tahun Anggaran","Kode Tender","Nama Paket","Kode RUP","KLPD","Nama Satker","Jenis Pengadaan","Metode Pengadaan","Nilai Pagu","Nilai HPS","Nama Pemenang","Nilai Kontrak","Nilai PDN","Nilai UMK","Sumber Dana","Jenis Kontrak","Tahap"
"2025","10005373000","Jasa Konsultansi Pengawasan Rehabilitasi/Peningkatan Dermaga dan Trestle Pelabuhan Carik - DAK","53841746","Provinsi Nusa Tenggara Barat","Dinas Perhubungan","Jasa Konsultansi Badan Usaha Non Konstruksi","Prakualifikasi Dua File","Rp. 831.107.200,00","Rp. 831.107.200,00","","0","0","0","","","Tender Sudah Selesai"
"2025","10020431000","Jasa Konsultan Perencanaan Gedung Perawatan TB dan Paru","55691138","Provinsi Nusa Tenggara Barat","Rumah Sakit H. L. Manambai Abdul Kadir","Jasa Konsultansi Badan Usaha Konstruksi","Prakualifikasi Dua File","Rp. 216.384.000,00","Rp. 216.384.000,00","CV. ADI CIPTA","215395500","215395500","215395500","","Penyedia Badan Usaha Non KSO","Tender Sudah Selesai"
"2025","10007149000","Jasa Konsultansi Pengawasan Rehabilitasi/Peningkatan Dermaga dan Trestle Pelabuhan Carik - DAK","53841746","Provinsi Nusa Tenggara Barat","Dinas Perhubungan","Jasa Konsultansi Badan Usaha Konstruksi","Prakualifikasi Dua File","Rp. 831.107.200,00","Rp. 831.100.000,00","","0","0","0","","","Tender Sudah Selesai"
"2025","10013663000","Desain Perencanaan untuk Kegiatan Kontraktual Sarana RS","55600206","Provinsi Nusa Tenggara Barat","Rumah Sakit Jiwa Mutiara Sukma Provinsi","Jasa Konsultansi Badan Usaha Konstruksi","Prakualifikasi Dua File","Rp. 300.000.000,00","Rp. 300.000.000,00","CV. ADI CIPTA","298756000","298756000","298756000","","Penyedia Badan Usaha Non KSO","Tender Sudah Selesai"
"2025","10050262000","Rehabilitasi Jaringan Irigasi D.I. Santong","59647338","Provinsi Nusa Tenggara Barat","Dinas Pekerjaan Umum dan Penataan Ruang","Pekerjaan Konstruksi","Pascakualifikasi Satu File","Rp. 3.363.011.000,00","Rp. 3.363.011.000,00","CV. RIDHO GRAHA","2924397000","2924397000","2924397000","","Penyedia Badan Usaha Non KSO","Tender Sudah Selesai"
"2025","10047550000","Konsultan Pengawasan Rehabilitasi Jaringan Irigasi D.I. Santong","59647140","Provinsi Nusa Tenggara Barat","Dinas Pekerjaan Umum dan Penataan Ruang","Jasa Konsultansi Badan Usaha Konstruksi","Prakualifikasi Dua File","Rp. 200.000.000,00","Rp. 200.000.000,00","PT. Yudhilla Angghalia","170190000","170190000","170190000","","Penyedia Badan Usaha Non KSO","Tender Sudah Selesai"
"2025","10052108000","Pembangunan Gedung Bunker Kedokteran Nuklir","57756474","Provinsi Nusa Tenggara Barat","Rumah Sakit Umum Daerah Provinsi","Pekerjaan Konstruksi","Pascakualifikasi Satu File","Rp. 10.000.000.000,00","Rp. 9.114.143.000,00","","0","0","0","","","Tender Sudah Selesai"
"2025","10050240000","Rehabilitasi Jaringan Irigasi D.I. Maronggek Kompleks","59647274","Provinsi Nusa Tenggara Barat","Dinas Pekerjaan Umum dan Penataan Ruang","Pekerjaan Konstruksi","Pascakualifikasi Satu File","Rp. 6.297.680.000,00","Rp. 6.297.680.000,00","CV. KINARA","5459855000","5459855000","5459855000","","Penyedia Badan Usaha Non KSO","Tender Sudah Selesai"
"2025","10050974000","Rehabilitasi Rumah Dinas Kejati","57393751","Provinsi Nusa Tenggara Barat","Dinas Pekerjaan Umum dan Penataan Ruang","Pekerjaan Konstruksi","Pascakualifikasi Satu File","Rp. 9.450.000.000,00","Rp. 9.450.000.000,00","","0","0","0","","","Tender Sudah Selesai"
"2025","10030046000","Belanja Modal Bangunan Gedung Kantor - Renovasi Ruang Komisi","58394250","Provinsi Nusa Tenggara Barat","Sekretariat Dewan Perwakilan Rakyat Daerah","Pekerjaan Konstruksi","Pascakualifikasi Satu File","Rp. 1.084.399.000,00","Rp. 1.077.745.310,15","PT. WIJAYA KARYA NUSACIPTA","905762000","905762000","905762000","","Penyedia Badan Usaha Non KSO","Tender Sudah Selesai"
"2025","10047528000","Konsultan Pengawasan Rehabilitasi Jaringan Irigasi D.I. Maronggek Kompleks","59647013","Provinsi Nusa Tenggara Barat","Dinas Pekerjaan Umum dan Penataan Ruang","Jasa Konsultansi Badan Usaha Konstruksi","Prakualifikasi Dua File","Rp. 250.000.000,00","Rp. 250.000.000,00","PT HELIUM PERSADA KONSULTAN","218448000","218448000","218448000","","Penyedia Badan Usaha Non KSO","Tender Sudah Selesai"
"2025","10051318000","Bangunan Baru Gedung Rehab Napza Sarana RS","56004811","Provinsi Nusa Tenggara Barat","Rumah Sakit Jiwa Mutiara Sukma Provinsi","Pekerjaan Konstruksi","Pascakualifikasi Satu File","Rp. 12.958.450.110,00","Rp. 12.958.450.110,00","CV. GRAHA UTAMA","12697561000","12697561000","12697561000","","Penyedia Badan Usaha Non KSO","Tender Sudah Selesai"
"2025","10062156000","Pembangunan Gedung Perawatan TB dan Paru","60083261","Provinsi Nusa Tenggara Barat","Rumah Sakit H. L. Manambai Abdul Kadir","Pekerjaan Konstruksi","Pascakualifikasi Satu File","Rp. 5.409.600.000,00","Rp. 5.409.600.000,00","","0","0","0","","","Tender Sudah Selesai"
"2025","10041789000","Belanja Modal Bangunan Kesehatan Konstruksi Poliklinik Infeksius dan TB Dot","55443144","Provinsi Nusa Tenggara Barat","Rumah Sakit Mandalika","Pekerjaan Konstruksi","Pascakualifikasi Satu File","Rp. 2.281.168.533,00","Rp. 2.281.000.000,00","cv.unique nusantara","1876567000","1876567000","1876567000","","Penyedia Badan Usaha Non KSO","Tender Sudah Selesai"
"2025","10070835000","Pembangunan Gedung Bunker Kedokteran Nuklir","57756474","Provinsi Nusa Tenggara Barat","Rumah Sakit Umum Daerah Provinsi","Pekerjaan Konstruksi","Pascakualifikasi Satu File","Rp. 10.000.000.000,00","Rp. 9.114.143.000,00","","0","0","0","","","Tender Sudah Selesai"`;

// --- Data Processing ---

const parsedData1 = robustParseCsv(csvData1);
const parsedData2 = robustParseCsv(csvData2);

const allProjectDataFromCsv1: Omit<Project, 'id'>[] = parsedData1.map((row, i) => {
    const budget = parseCurrency(row['Nilai Pagu'] || '0');
    const realization = parseCurrency(row['Nilai Total Realiasai'] || '0');
    let coords = generateNtbCoordinates();
    if (typeof coords.lintang !== 'number' || !isFinite(coords.lintang) || typeof coords.bujur !== 'number' || !isFinite(coords.bujur)) {
        coords = { lintang: -8.58, bujur: 116.12 }; // Stricter Safe default
    }
    return {
        name: row['Nama Paket'] || 'Tanpa Nama',
        type: 'Swakelola',
        location: row['K/L/PD'] || 'Nusa Tenggara Barat',
        coordinates: coords,
        progress: budget > 0 ? Math.round((realization / budget) * 100) : 0,
        budget: budget,
        hps: budget, // HPS is not available in this dataset, using budget as a fallback
        realization: realization,
        status: normalizeStatus(row['Status Paket'] || 'Perencanaan'),
        providerName: row['Nama Pelaksana'] || 'Swakelola Internal',
        providerAddress: row['Nama Satker'] || 'Nusa Tenggara Barat',
        opdName: row['Nama Satker'] || 'OPD Tidak Diketahui',
        imageUrl: getPlaceholderImage()
    };
});

const allProjectDataFromCsv2: Omit<Project, 'id'>[] = parsedData2.map((row, i) => {
    const budget = parseCurrency(row['Nilai Pagu'] || '0');
    const realization = parseCurrency(row['Nilai Kontrak'] || '0');
     let coords = generateNtbCoordinates();
    if (typeof coords.lintang !== 'number' || !isFinite(coords.lintang) || typeof coords.bujur !== 'number' || !isFinite(coords.bujur)) {
        coords = { lintang: -8.58, bujur: 116.12 }; // Stricter Safe default
    }
    return {
        name: row['Nama Paket'] || 'Tanpa Nama',
        type: normalizeType(row['Jenis Pengadaan'] || 'Tender'),
        // FIX: Correctly access 'KLPD' and 'Tahap' which exist in csvData2
        location: row['KLPD'] || 'Nusa Tenggara Barat',
        coordinates: coords,
        progress: budget > 0 ? Math.round((realization / budget) * 100) : 0,
        budget: budget,
        hps: parseCurrency(row['Nilai HPS'] || '0'),
        realization: realization,
        status: normalizeStatus(row['Tahap'] || 'Perencanaan'),
        providerName: row['Nama Pemenang'] || 'Belum Ada Pemenang',
        providerAddress: row['KLPD'] || 'Nusa Tenggara Barat',
        opdName: row['Nama Satker'] || 'OPD Tidak Diketahui',
        imageUrl: getPlaceholderImage()
    };
});


// Combine the data from both sources
export const PROJECTS: Project[] = [...allProjectDataFromCsv1, ...allProjectDataFromCsv2]
    .filter(p => p.name !== 'Tanpa Nama') // Filter out invalid entries if any
    .map((p, index) => ({
        ...p,
        id: index + 1
    }));