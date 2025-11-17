import React, { useState, useMemo, useEffect } from 'react';
import { Project } from '../types';
import MapView from './MapView';
import ProjectList from './ProjectList';
import DashboardStats from './DashboardStats';
import PublicProjectDetailModal from './PublicProjectDetailModal';
import HeroSlider from './HeroSlider';
import Footer from './Footer';
import ReportCharts from './ReportCharts';

interface PublicHomeProps {
  projects: Project[];
  onAdminLogin: () => void;
  selectedProjectId: number | null;
  onSelectProject: (id: number | null) => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ projects, onAdminLogin, selectedProjectId, onSelectProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectForModal, setProjectForModal] = useState<Project | null>(null);

  // Filter state for ProjectList
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpd, setSelectedOpd] = useState('Semua OPD');
  const [selectedType, setSelectedType] = useState('Semua Jenis');

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
        const matchesSearchTerm = !searchTerm ||
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesOpd = selectedOpd === 'Semua OPD' || p.opdName === selectedOpd;
        const matchesType = selectedType === 'Semua Jenis' || p.type === selectedType;
        return matchesSearchTerm && matchesOpd && matchesType;
    });
  }, [projects, searchTerm, selectedOpd, selectedType]);
  
  useEffect(() => {
    if (filteredProjects.length > 0) {
        const isSelectedProjectVisible = filteredProjects.some(p => p.id === selectedProjectId);
        if (!isSelectedProjectVisible) {
            onSelectProject(filteredProjects[0].id);
        }
    } else {
        onSelectProject(null);
    }
  }, [filteredProjects, selectedProjectId, onSelectProject]);
  
  const handleOpenDetailsModal = (projectId: number) => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
          setProjectForModal(project);
          setIsModalOpen(true);
      }
  };
  
  const handleSelectProject = (id: number) => {
    onSelectProject(id);
    handleOpenDetailsModal(id);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setProjectForModal(null);
  };
  
  const heroProjects = useMemo(() => {
      return [...projects]
          .sort((a, b) => b.budget - a.budget)
          .slice(0, 5)
          .filter(p => p.imageUrl); 
  }, [projects]);

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Coat_of_arms_of_West_Nusa_Tenggara.svg/250px-Coat_of_arms_of_West_Nusa_Tenggara.svg.png" alt="Logo NTB" className="h-10 w-auto" />
             <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Monitoring Paket Pengadaan Provinsi NTB</h1>
          </div>
          <button
            onClick={onAdminLogin}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Admin Login
          </button>
        </div>
      </header>

      <main>
        <HeroSlider projects={heroProjects} onSelectProject={handleOpenDetailsModal} />
        
        <div id="stats" className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
            <DashboardStats projects={filteredProjects} totalProjectsCount={projects.length} />
        </div>
        
        <section id="reports" className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <ReportCharts projects={filteredProjects} />
        </section>

        <div id="dashboard-main" className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[60vh] lg:h-[calc(100vh-14rem)] lg:sticky lg:top-24">
                     <ProjectList 
                        filteredProjects={filteredProjects}
                        allProjects={projects}
                        selectedProjectId={selectedProjectId}
                        onSelectProject={handleSelectProject}
                        isAdmin={false}
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        selectedOpd={selectedOpd}
                        onSelectedOpdChange={setSelectedOpd}
                        selectedType={selectedType}
                        onSelectedTypeChange={setSelectedType}
                     />
                </div>
                <div className="lg:col-span-2 h-[60vh] lg:h-[calc(100vh-14rem)] rounded-lg overflow-hidden shadow-lg">
                    <MapView 
                        projects={filteredProjects} 
                        selectedProjectId={selectedProjectId} 
                        onSelectProject={handleSelectProject}
                    />
                </div>
            </div>
        </div>
      </main>
      
      <Footer />

      <PublicProjectDetailModal 
        project={projectForModal}
        onClose={closeModal}
        onSelectProject={(id) => {
            handleSelectProject(id);
        }}
      />
    </div>
  );
};

export default PublicHome;
