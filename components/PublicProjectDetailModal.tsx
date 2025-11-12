import React from 'react';
import { Project } from '../types';

interface PublicProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onSelectProject: (id: number) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Selesai':
      return 'bg-green-100 text-green-800';
    case 'Dalam Proses':
      return 'bg-blue-100 text-blue-800';
    case 'Ditunda':
      return 'bg-yellow-100 text-yellow-800';
    case 'Beresiko':
      return 'bg-red-100 text-red-800';
    case 'Perencanaan':
      return 'bg-slate-100 text-slate-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const DetailItem: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
  <div>
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`text-base font-semibold text-slate-900 ${className}`}>{value}</p>
  </div>
);

const PublicProjectDetailModal: React.FC<PublicProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-[1000] flex justify-center items-center p-4 transition-opacity duration-300"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-56 w-full rounded-t-lg bg-slate-200">
            <img src={project.imageUrl || 'https://i.imgur.com/jGTEG3D.jpeg'} alt={project.name} className="w-full h-full object-cover rounded-t-lg" />
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/50 p-2 rounded-full text-slate-800 hover:bg-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <div className="mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">{project.name}</h2>
            <p className="text-md text-slate-500">{project.location}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 border-t pt-4">
            <DetailItem label="Jenis Paket" value={project.type} />
            <DetailItem label="OPD/Dinas" value={project.opdName} />
            <DetailItem label="Nama Penyedia" value={project.providerName} />
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Detail Anggaran</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <DetailItem label="Pagu Paket" value={formatCurrency(project.budget)} className="text-blue-700" />
              <DetailItem label="Nilai HPS" value={formatCurrency(project.hps)} className="text-orange-700" />
              <DetailItem label="Nilai Realisasi" value={formatCurrency(project.realization)} className="text-green-700" />
              <div className="sm:col-span-2 lg:col-span-1">
                  <p className="text-sm text-slate-500">Progres Penyerapan</p>
                  <div className="w-full bg-slate-200 rounded-full h-4 mt-1 relative">
                      <div className="bg-green-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ width: `${project.progress}%` }}>
                          {project.progress > 10 && `${project.progress}%`}
                      </div>
                      {project.progress <= 10 && <span className="absolute left-2 top-0 bottom-0 flex items-center text-slate-700 text-xs font-bold">{project.progress}%</span>}
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProjectDetailModal;
