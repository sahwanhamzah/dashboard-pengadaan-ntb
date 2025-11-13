import React, { useState, useMemo, useEffect } from 'react';
import { Project } from './types';
import PublicHome from './components/PublicHome';
import AdminDashboard from './components/AdminDashboard';
import AddProjectModal from './components/AddProjectModal';
import EditProjectModal from './components/EditProjectModal';
import ImportDataModal from './components/ImportDataModal';

function App() {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari server. Pastikan API dan Google Sheet sudah terkonfigurasi dengan benar.');
      }
      const data: Project[] = await response.json();
      const sortedProjects = data.sort((a, b) => b.id - a.id);
      setProjects(sortedProjects);
      if (sortedProjects.length > 0 && selectedProjectId === null) {
        setSelectedProjectId(sortedProjects[0].id);
      }
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);


  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);
  
  const handleSelectProject = (id: number | null) => {
    setSelectedProjectId(id);
  };

  const handleAddProject = async (projectData: Omit<Project, 'id' | 'progress'>) => {
    const lastId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) : 0;
    const newProjectData: Omit<Project, 'progress'> = {
      ...projectData,
      id: lastId + 1,
    };
    const newProject: Project = {
        ...newProjectData,
        progress: projectData.budget > 0 ? Math.round((projectData.realization / projectData.budget) * 100) : 0,
    }

    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProject),
        });
        if (!response.ok) throw new Error('Gagal menambahkan proyek.');
        const addedProject = await response.json();
        
        const updatedProjects = [addedProject, ...projects];
        setProjects(updatedProjects);
        setAddModalOpen(false);
        setSelectedProjectId(addedProject.id);

    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
     try {
        const response = await fetch('/api/projects', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProject),
        });
        if (!response.ok) throw new Error('Gagal memperbarui proyek.');
        
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        setEditModalOpen(false);
        setProjectToEdit(null);

     } catch (err: any) {
         setError(err.message);
     }
  };

  const handleDeleteProject = async (id: number) => {
    try {
        const response = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Gagal menghapus proyek.');

        const remainingProjects = projects.filter(p => p.id !== id);
        setProjects(remainingProjects);
        if (selectedProjectId === id) {
            setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
        }
    } catch (err: any) {
        setError(err.message);
    }
  };
  
  const handleImportProjects = async (importedProjects: Omit<Project, 'id' | 'progress'>[]) => {
      setIsLoading(true);
      setError(null);
      const lastId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) : 0;

      const newProjects: Project[] = importedProjects.map((p, i) => ({
        ...p,
        id: lastId + i + 1,
        progress: p.budget > 0 ? Math.round((p.realization / p.budget) * 100) : 0,
      }));

      try {
        // Use Promise.all to send all requests in parallel
        await Promise.all(newProjects.map(p => fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
        })));
        
        // After all imports are successful, fetch the latest list
        await fetchProjects();
        setImportModalOpen(false);

      } catch (err: any) {
          setError('Terjadi kesalahan saat mengimpor data. Beberapa data mungkin tidak tersimpan.');
      } finally {
          setIsLoading(false);
      }
  };


  const handleEditClick = (project: Project) => {
    setProjectToEdit(project);
    setEditModalOpen(true);
  };
  
  if (isLoading && projects.length === 0) {
      return <div className="flex justify-center items-center min-h-screen">Memuat data proyek dari server...</div>
  }
  
  const MainContent: React.FC = () => (
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
      </>
  );

  return (
    <>
      {error && (
         <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-[2000]" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
        </div>
      )}

      {projects.length > 0 ? (
          <MainContent />
      ) : !isLoading && error ? (
           <div className="flex flex-col justify-center items-center min-h-screen text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Gagal Memuat Data</h2>
                <p className="text-slate-600 mb-4">{error}</p>
                <button onClick={fetchProjects} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Coba Lagi</button>
            </div>
      ) : (
          !isLoading && <div className="flex justify-center items-center min-h-screen">Tidak ada data proyek untuk ditampilkan.</div>
      )}
      
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
