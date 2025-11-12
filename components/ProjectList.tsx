import React, { useMemo } from 'react';
import { Project, ProjectType } from '../types';

interface ProjectListProps {
  filteredProjects: Project[];
  allProjects: Project[]; // Needed for generating OPD options
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
  onAddProjectClick?: () => void;
  onImportClick?: () => void;
  isAdmin?: boolean;
  
  // Filter state and handlers are now props
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedOpd: string;
  onSelectedOpdChange: (opd: string) => void;
  selectedType: string;
  onSelectedTypeChange: (type: string) => void;
}

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

const getTypeColor = (type: ProjectType) => {
    switch (type) {
        case 'Tender':
            return 'bg-purple-100 text-purple-800';
        case 'Non-Tender':
            return 'bg-orange-100 text-orange-800';
        case 'Swakelola':
            return 'bg-teal-100 text-teal-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

const ProjectListItem: React.FC<{ project: Project; isSelected: boolean; onSelect: () => void; }> = ({ project, isSelected, onSelect }) => {
  const selectedClasses = isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent hover:bg-slate-50';
  
  return (
    <li
      onClick={onSelect}
      className={`p-4 cursor-pointer transition-all duration-200 ${selectedClasses}`}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-slate-900 text-sm truncate pr-2 flex-grow">{project.name}</h3>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(project.type)}`}>
              {project.type}
            </span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-1">{project.location}</p>
    </li>
  );
};


const ProjectList: React.FC<ProjectListProps> = ({ 
  filteredProjects,
  allProjects,
  selectedProjectId, 
  onSelectProject, 
  onAddProjectClick, 
  onImportClick,
  isAdmin = true,
  searchTerm,
  onSearchTermChange,
  selectedOpd,
  onSelectedOpdChange,
  selectedType,
  onSelectedTypeChange,
}) => {
  const opdOptions = useMemo(() => {
    const allOpds = allProjects.map(p => p.opdName);
    return ['Semua OPD', ...Array.from(new Set(allOpds)).sort()];
  }, [allProjects]);

  const typeOptions: (string | ProjectType)[] = ['Semua Jenis', 'Tender', 'Non-Tender', 'Swakelola'];

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full min-h-[400px]">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Daftar Paket</h2>
            {isAdmin && (
                <div className="flex items-center gap-2">
                    {onImportClick && (
                        <button
                            onClick={onImportClick}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors flex items-center gap-1.5"
                            title="Impor Data dari CSV"
                        >
                            <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Impor
                        </button>
                    )}
                    {onAddProjectClick && (
                        <button 
                            onClick={onAddProjectClick}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                            + Tambah
                        </button>
                    )}
                </div>
            )}
        </div>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Cari paket pengadaan..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <div>
                <label htmlFor="type-filter" className="sr-only">Filter by Jenis Paket</label>
                <select
                  id="type-filter"
                  value={selectedType}
                  onChange={e => onSelectedTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {typeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            <div>
              <label htmlFor="opd-filter" className="sr-only">Filter by OPD/Dinas</label>
              <select
                id="opd-filter"
                value={selectedOpd}
                onChange={e => onSelectedOpdChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {opdOptions.map(opd => (
                  <option key={opd} value={opd}>{opd}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <ul className="divide-y divide-slate-200 overflow-y-auto flex-grow">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <ProjectListItem 
              key={project.id}
              project={project}
              isSelected={project.id === selectedProjectId}
              onSelect={() => onSelectProject(project.id)}
            />
          ))
        ) : (
          <p className="text-center text-slate-500 p-6">Paket pengadaan tidak ditemukan.</p>
        )}
      </ul>
    </div>
  );
};

export default ProjectList;
