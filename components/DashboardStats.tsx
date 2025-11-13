import React from 'react';
import { Project } from '../types';

interface DashboardStatsProps {
  projects: Project[];
  totalProjectsCount: number;
}

const StatCard: React.FC<{ title: string; value: string | number; description: string; }> = ({ title, value, description }) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
    <div>
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
    <p className="text-xs text-slate-400 mt-2">{description}</p>
  </div>
);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};


const DashboardStats: React.FC<DashboardStatsProps> = ({ projects, totalProjectsCount }) => {
  const stats = React.useMemo(() => {
    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalHps = projects.reduce((sum, p) => sum + p.hps, 0);
    const totalRealization = projects.reduce((sum, p) => sum + p.realization, 0);
    const completionPercentage = totalBudget > 0 ? (totalRealization / totalBudget) * 100 : 0;
    
    return { totalProjects, totalBudget, totalHps, totalRealization, completionPercentage };
  }, [projects]);
  
  const isFiltered = totalProjectsCount > 0 && projects.length !== totalProjectsCount;
  const paketDataSourceText = isFiltered ? "paket yang ditampilkan" : "semua paket";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Paket"
        value={stats.totalProjects}
        description={isFiltered ? `Menampilkan ${stats.totalProjects} dari ${totalProjectsCount} paket.` : "Jumlah keseluruhan paket yang terdaftar."}
      />
      <StatCard
        title="Nilai Pagu Paket"
        value={formatCurrency(stats.totalBudget)}
        description={`Akumulasi pagu dari ${paketDataSourceText}.`}
      />
      <StatCard
        title="Nilai HPS Paket"
        value={formatCurrency(stats.totalHps)}
        description={`Akumulasi HPS dari ${paketDataSourceText}.`}
      />
      <StatCard
        title="Total Realisasi"
        value={formatCurrency(stats.totalRealization)}
        description={`Akumulasi dana yang sudah terealisasi dari ${paketDataSourceText}.`}
      />
       <StatCard
        title="Realisasi"
        value={`${stats.completionPercentage.toFixed(1)}%`}
        description={`Persentase penyerapan pagu dari ${paketDataSourceText}.`}
      />
    </div>
  );
};

export default DashboardStats;
