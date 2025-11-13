import React, { useState, useMemo } from 'react';
import { PROJECTS } from './constants';
import { Project, ProjectStatus, ProjectType } from './types';
import PublicHome from './components/PublicHome';
import AdminDashboard from './components/AdminDashboard';
import AddProjectModal from './components/AddProjectModal';
import EditProjectModal from './components/EditProjectModal';

// Defined within App.tsx to avoid creating new files, respecting submission constraints.
const ImportDataModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onImportProjects: (projects: Omit<Project, 'id' | 'progress'>[]) => void;
}> = ({ isOpen, onClose, onImportProjects }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // These helper functions are duplicated from `constants.ts` because we can't export them from there.
  // This is a trade-off to keep the component self-contained.
  const parseCurrency = (value: string): number => {
      if (!value || typeof value !== 'string' || value.trim() === "") return 0;
      const numericString = value.replace(/Rp\.\s?|,\d{2}$|\./g, '').trim();
      const number = parseFloat(numericString);
      return isNaN(number) ? 0 : number;
  };

  const normalizeStatus = (status: string): ProjectStatus => {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes('selesai') || lowerStatus.includes('sudah selesai')) return 'Selesai';
      if (lowerStatus.includes('berjalan') || lowerStatus.includes('proses') || lowerStatus.includes('penandatanganan')) return 'Dalam Proses';
      if (lowerStatus.includes('ditunda') || lowerStatus.includes('dibatalkan') || lowerStatus.includes('ditutup')) return 'Ditunda';
      return 'Perencanaan';
  };

  const normalizeType = (type: string): ProjectType => {
      const lowerType = type.toLowerCase();
      if (lowerType.includes('swakelola')) return 'Swakelola';
      if (lowerType.includes('non') && (lowerType.includes('tender') || lowerType.includes('konstruksi'))) return 'Non-Tender';
      if (lowerType.includes('konsultansi') || lowerType.includes('konstruksi') || lowerType.includes('barang') || lowerType.includes('lainnya')) return 'Tender';
      return 'Tender';
  };
  
  const generateNtbCoordinates = (): { lintang: number; bujur: number } => {
    const minLat = -9.0, maxLat = -8.1, minLng = 115.7, maxLng = 119.2;
    const lintang = Math.random() * (maxLat - minLat) + minLat;
    const bujur = Math.random() * (maxLng - minLng) + minLng;
    return { lintang: parseFloat(lintang.toFixed(4)), bujur: parseFloat(bujur.toFixed(4)) };
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
                    currentField += '"';
                    i++; 
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        values.push(currentField);

        if (values.length >= headers.length) {
            return headers.reduce((obj, header, index) => {
                obj[header] = (values[index] || '').trim().replace(/^"|"$/g, '');
                return obj;
            }, {} as Record<string, string>);
        }
        return null;
    }).filter((row): row is Record<string, string> => row !== null);
    
    return data;
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleImport = () => {
    if (!file) {
      setError('Silakan pilih file CSV terlebih dahulu.');
      return;
    }
    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedData = robustParseCsv(text);
        const firstRow = parsedData[0];
        
        if (!firstRow) {
            throw new Error('File CSV kosong atau format tidak dikenali.');
        }

        let projects: Omit<Project, 'id' | 'progress'>[];
        const headers = Object.keys(firstRow);
        
        // --- Format Detection ---
        if (headers.includes('Nilai Kontrak') && headers.includes('Jenis Pengadaan')) {
            // TENDER / NON-TENDER FORMAT
            projects = parsedData.map((row, i): Omit<Project, 'id' | 'progress'> => {
                const budget = parseCurrency(row['Nilai Pagu'] || '0');
                const realization = parseCurrency(row['Nilai Kontrak'] || '0');
                let coords = generateNtbCoordinates();
                if (typeof coords.lintang !== 'number' || !isFinite(coords.lintang) || typeof coords.bujur !== 'number' || !isFinite(coords.bujur)) {
                    coords = { lintang: -8.58, bujur: 116.12 }; // Stricter Safe default
                }
                return {
                    name: row['Nama Paket'] || 'Tanpa Nama',
                    type: normalizeType(row['Jenis Pengadaan'] || 'Tender'),
                    location: row['KLPD'] || row['K/L/PD'] || 'Nusa Tenggara Barat',
                    coordinates: coords,
                    budget: budget,
                    hps: parseCurrency(row['Nilai HPS'] || '0'),
                    realization: realization,
                    status: normalizeStatus(row['Tahap'] || row['Status Paket'] || 'Perencanaan'),
                    providerName: row['Nama Pemenang'] || 'Belum Ada Pemenang',
                    providerAddress: row['KLPD'] || row['K/L/PD'] || 'Nusa Tenggara Barat',
                    opdName: row['Nama Satker'] || 'OPD Tidak Diketahui',
                    imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`
                };
            });
        } else if (headers.includes('Nilai Total Realiasai') && headers.includes('Tipe Swakelola')) {
            // SWAKELOLA FORMAT
            projects = parsedData.map((row, i): Omit<Project, 'id' | 'progress'> => {
                const budget = parseCurrency(row['Nilai Pagu'] || '0');
                const realization = parseCurrency(row['Nilai Total Realiasai'] || '0');
                let coords = generateNtbCoordinates();
                if (typeof coords.lintang !== 'number' || !isFinite(coords.lintang) || typeof coords.bujur !== 'number' || !isFinite(coords.bujur)) {
                    coords = { lintang: -8.58, bujur: 116.12 }; // Stricter Safe default
                }
                return {
                    name: row['Nama Paket'] || 'Tanpa Nama',
                    type: 'Swakelola',
                    location: row['K/L/PD'] || row['KLPD'] || 'Nusa Tenggara Barat',
                    coordinates: coords,
                    budget: budget,
                    hps: budget, // Fallback for HPS in Swakelola
                    realization: realization,
                    status: normalizeStatus(row['Status Paket'] || 'Perencanaan'),
                    providerName: row['Nama Pelaksana'] || 'Swakelola Internal',
                    providerAddress: row['Nama Satker'] || 'Nusa Tenggara Barat',
                    opdName: row['Nama Satker'] || 'OPD Tidak Diketahui',
                    imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`
                };
            });
        } else {
            throw new Error('Format CSV tidak dikenali. Pastikan file Anda adalah data Tender atau Swakelola yang valid.');
        }
        
        onImportProjects(projects.filter(p => p.name !== 'Tanpa Nama'));
        handleClose();
      } catch (e: any) {
        setError(e.message || 'Gagal memproses file. Periksa format dan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError('Gagal membaca file.');
        setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-900">Impor Data dari CSV</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Pilih file CSV untuk mengimpor data paket pengadaan. Aplikasi dapat mengenali format data Tender dan Swakelola secara otomatis.
          </p>
          <div className="p-3 bg-slate-100 rounded-md text-xs text-slate-500 space-y-2">
            <div>
                <b className="text-slate-600">Format Tender/Non-Tender:</b> 
                <code className="block mt-1 whitespace-pre-wrap text-[10px]">"Nama Paket", "Nilai Pagu", "Nilai HPS", "Nilai Kontrak", "Tahap" (atau "Status Paket"), "Jenis Pengadaan", "Nama Satker", "Nama Pemenang", "KLPD" (atau "K/L/PD")</code>
            </div>
             <div>
                <b className="text-slate-600">Format Swakelola:</b> 
                <code className="block mt-1 whitespace-pre-wrap text-[10px]">"Nama Paket", "Nilai Pagu", "Tipe Swakelola", "Nama Pelaksana", "Nilai Total Realiasai", "Status Paket", "Nama Satker", "K/L/PD"</code>
            </div>
          </div>
          <div>
            <label htmlFor="csv-file" className="block text-sm font-medium text-slate-700 mb-1">File CSV</label>
            <input 
              type="file" 
              id="csv-file" 
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</p>}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">Batal</button>
            <button 
              type="button" 
              onClick={handleImport} 
              disabled={!file || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Mengimpor...' : 'Impor Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


function App() {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(PROJECTS.length > 0 ? PROJECTS[0].id : null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);
  
  const handleSelectProject = (id: number | null) => {
    setSelectedProjectId(id);
  };

  const handleAddProject = (projectData: Omit<Project, 'id' | 'progress'>) => {
    // Final validation layer to ensure data integrity before updating state
    const { lintang, bujur } = projectData.coordinates;
    if (!projectData.coordinates || typeof lintang !== 'number' || !isFinite(lintang) || typeof bujur !== 'number' || !isFinite(bujur)) {
      console.error("Data proyek tidak valid diterima dari modal tambah:", projectData);
      alert("Gagal menambahkan proyek: Koordinat yang diberikan tidak valid. Silakan periksa kembali input Anda.");
      setAddModalOpen(false); // Close the modal to prevent resubmission of bad data
      return;
    }
    
    const newProject: Project = {
      ...projectData,
      id: Math.max(...projects.map(p => p.id), 0) + 1,
      progress: projectData.budget > 0 ? Math.round((projectData.realization / projectData.budget) * 100) : 0,
    };
    setProjects(prevProjects => [newProject, ...prevProjects]);
    setAddModalOpen(false);
    setSelectedProjectId(newProject.id); // Select the new project
  };

  const handleUpdateProject = (updatedProject: Project) => {
    // Final validation layer to ensure data integrity before updating state
    const { lintang, bujur } = updatedProject.coordinates;
    if (!updatedProject.coordinates || typeof lintang !== 'number' || !isFinite(lintang) || typeof bujur !== 'number' || !isFinite(bujur)) {
      console.error("Data proyek tidak valid diterima dari modal edit:", updatedProject);
      alert("Gagal memperbarui proyek: Koordinat yang diberikan tidak valid. Silakan periksa kembali input Anda.");
      setEditModalOpen(false); // Close the modal
      setProjectToEdit(null);
      return;
    }
    
    setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setEditModalOpen(false);
    setProjectToEdit(null);
  };

  const handleDeleteProject = (id: number) => {
    const remainingProjects = projects.filter(p => p.id !== id);
    setProjects(remainingProjects);
    if (selectedProjectId === id) {
        // If the deleted project was selected, select the first one in the list or null
        setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
    }
  };
  
  const handleImportProjects = (importedProjects: Omit<Project, 'id' | 'progress'>[]) => {
      const lastId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) : 0;
      
      const newProjects = importedProjects.map((p, index) => ({
          ...p,
          id: lastId + index + 1,
          progress: p.budget > 0 ? Math.round((p.realization / p.budget) * 100) : 0,
      }));

      setProjects(prev => [...newProjects, ...prev]);
      setImportModalOpen(false);
      
      // Select the first of the newly imported projects
      if (newProjects.length > 0) {
          setSelectedProjectId(newProjects[0].id);
      }
  };


  const handleEditClick = (project: Project) => {
    setProjectToEdit(project);
    setEditModalOpen(true);
  };

  return (
    <>
      {view === 'public' ? (
        <PublicHome 
          projects={projects} 
          onAdminLogin={() => setView('admin')}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
        />
      ) : (
        <AdminDashboard
          projects={projects}
          selectedProjectId={selectedProjectId}
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
          onAddProjectClick={() => setAddModalOpen(true)}
          onImportClick={() => setImportModalOpen(true)}
          onEditClick={handleEditClick}
          onDeleteProject={handleDeleteProject}
          onGoToPublicView={() => setView('public')}
        />
      )}
      
      {/* Modals are available in both views but only triggered from admin */}
      <AddProjectModal 
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddProject={handleAddProject}
      />

      <EditProjectModal 
        isOpen={isEditModalOpen}
        onClose={() => {
            setEditModalOpen(false);
            setProjectToEdit(null);
        }}
        onUpdateProject={handleUpdateProject}
        projectToEdit={projectToEdit}
      />
      
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportProjects={handleImportProjects}
      />
    </>
  );
}

export default App;
