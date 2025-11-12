import React from 'react';
import { Project } from '../types';
import MapView from './MapView';

interface ProjectDetailsProps {
  project: Project | null;
  allProjects: Project[];
  onSelectProjectOnMap: (id: number) => void;
  onEditClick: (project: Project) => void;
  onDeleteProject: (id: number) => void;
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
    <p className={`text-base font-medium text-slate-900 ${className}`}>{value}</p>
  </div>
);

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, allProjects, onSelectProjectOnMap, onEditClick, onDeleteProject }) => {
  if (!project) {
    return (
      <div className="bg-white rounded-lg shadow-md h-full flex justify-center items-center">
        <p className="text-slate-500">Pilih paket pengadaan untuk melihat detailnya.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="relative h-64 md:h-80 w-full rounded-t-lg overflow-hidden">
        <MapView 
            projects={allProjects} 
            selectedProjectId={project.id} 
            onSelectProject={onSelectProjectOnMap}
        />
      </div>
      <div className="p-6 flex-grow overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{project.name}</h2>
            <p className="text-sm text-slate-500">{project.location}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => onEditClick(project)}
              className="p-2 bg-slate-100 rounded-md hover:bg-slate-200"
              title="Edit Paket"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
              </svg>
            </button>
            <button 
              onClick={() => {
                if(window.confirm(`Apakah Anda yakin ingin menghapus paket "${project.name}"?`)){
                    onDeleteProject(project.id);
                }
              }}
              className="p-2 bg-red-50 rounded-md hover:bg-red-100"
              title="Hapus Paket"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 border-t pt-4">
          <DetailItem label="Jenis Paket" value={project.type} />
          <DetailItem label="OPD/Dinas" value={project.opdName} />
          <DetailItem label="Nama Penyedia" value={project.providerName} />
          <DetailItem label="Alamat Penyedia" value={project.providerAddress} />
        </div>
        
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Detail Anggaran</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <DetailItem label="Pagu Paket" value={formatCurrency(project.budget)} className="text-blue-600" />
            <DetailItem label="Nilai HPS" value={formatCurrency(project.hps)} className="text-orange-600" />
            <DetailItem label="Nilai Realisasi" value={formatCurrency(project.realization)} className="text-green-600" />
            <div>
                <p className="text-sm text-slate-500">Progres Penyerapan</p>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
                <p className="text-base font-medium text-slate-900 mt-1">{project.progress}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
