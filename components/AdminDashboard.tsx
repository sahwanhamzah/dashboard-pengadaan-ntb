import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import DashboardStats from './DashboardStats';
import ProjectList from './ProjectList';
import ProjectDetails from './ProjectDetails';
import ReportCharts from './ReportCharts';

interface AdminDashboardProps {
    projects: Project[];
    selectedProjectId: number | null;
    selectedProject: Project | null;
    onSelectProject: (id: number | null) => void;
    onAddProjectClick: () => void;
    onImportClick: () => void;
    onEditClick: (project: Project) => void;
    onDeleteProject: (id: number) => void;
    onGoToPublicView: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    projects,
    selectedProjectId,
    selectedProject,
    onSelectProject,
    onAddProjectClick,
    onImportClick,
    onEditClick,
    onDeleteProject,
    onGoToPublicView
}) => {
    // Lifted state for filters
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

    // When filters change, if the currently selected project is no longer in the filtered list,
    // select the first project from the new filtered list. This avoids showing details for a hidden project.
    React.useEffect(() => {
        if (filteredProjects.length > 0) {
            const isSelectedProjectVisible = filteredProjects.some(p => p.id === selectedProjectId);
            if (!isSelectedProjectVisible) {
                onSelectProject(filteredProjects[0].id);
            }
        } else {
             // if no projects match filter, clear selection
            onSelectProject(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredProjects, selectedProjectId]);


    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Monitoring Pengadaan NTB</h1>
                    <button
                        onClick={onGoToPublicView}
                        className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-medium rounded-md hover:bg-slate-300 transition-colors"
                    >
                        Lihat Halaman Publik
                    </button>
                </div>
            </header>
            
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6">
                    <DashboardStats projects={filteredProjects} totalProjectsCount={projects.length} />
                </div>

                <section className="mb-6">
                    <ReportCharts projects={filteredProjects} />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <ProjectList 
                            filteredProjects={filteredProjects}
                            allProjects={projects}
                            selectedProjectId={selectedProjectId}
                            onSelectProject={onSelectProject}
                            onAddProjectClick={onAddProjectClick}
                            onImportClick={onImportClick}
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            selectedOpd={selectedOpd}
                            onSelectedOpdChange={setSelectedOpd}
                            selectedType={selectedType}
                            onSelectedTypeChange={setSelectedType}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <ProjectDetails 
                            project={selectedProject}
                            allProjects={projects}
                            onSelectProjectOnMap={onSelectProject}
                            onEditClick={onEditClick}
                            onDeleteProject={onDeleteProject}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;