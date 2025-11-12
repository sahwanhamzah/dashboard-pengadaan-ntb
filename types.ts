export type ProjectStatus = 'Perencanaan' | 'Dalam Proses' | 'Selesai' | 'Ditunda' | 'Beresiko';
export type ProjectType = 'Tender' | 'Non-Tender' | 'Swakelola';

export interface Project {
  id: number;
  name: string;
  type: ProjectType;
  location: string;
  coordinates: {
    lintang: number;
    bujur: number;
  };
  progress: number;
  budget: number; // Pagu Paket
  hps: number; // HPS Paket
  realization: number;
  status: ProjectStatus;
  providerName: string;
  providerAddress: string;
  opdName: string;
  imageUrl?: string;
}