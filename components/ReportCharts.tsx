import React, { useMemo } from 'react';
import { Project, ProjectStatus, ProjectType } from '../types';

interface ReportChartsProps {
  projects: Project[];
}

// Helper to get colors for different statuses and types
const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case 'Selesai': return 'bg-green-500';
    case 'Dalam Proses': return 'bg-blue-500';
    case 'Ditunda': return 'bg-yellow-500';
    case 'Beresiko': return 'bg-red-500';
    case 'Perencanaan': return 'bg-slate-500';
    default: return 'bg-gray-500';
  }
};

const getTypeColor = (type: ProjectType) => {
    switch (type) {
        case 'Tender': return 'bg-purple-500';
        case 'Non-Tender': return 'bg-orange-500';
        case 'Swakelola': return 'bg-teal-500';
        default: return 'bg-gray-500';
    }
}

const ChartCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
        <h3 className="text-md font-semibold text-slate-700 mb-4">{title}</h3>
        <div className="flex-grow">{children}</div>
    </div>
);

const Bar: React.FC<{ label: string; value: number; maxValue: number; color: string; percentage: string; }> = ({ label, value, maxValue, color, percentage }) => (
    <div className="flex items-center gap-3 mb-2 text-sm">
        <div className="w-24 text-slate-600 truncate text-right">{label}</div>
        <div className="flex-grow bg-slate-200 rounded-full h-5 relative">
            <div 
                className={`${color} h-5 rounded-full`}
                style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-white mix-blend-difference">
                {value} ({percentage})
            </span>
        </div>
    </div>
);


const ReportCharts: React.FC<ReportChartsProps> = ({ projects }) => {

    const statsByStatus = useMemo(() => {
        const counts: Record<ProjectStatus, number> = {
            'Perencanaan': 0,
            'Dalam Proses': 0,
            'Selesai': 0,
            'Ditunda': 0,
            'Beresiko': 0,
        };
        projects.forEach(p => {
            if (counts[p.status] !== undefined) {
                counts[p.status]++;
            }
        });
        return Object.entries(counts)
            .map(([status, count]) => ({ status: status as ProjectStatus, count }))
            .filter(item => item.count > 0)
            .sort((a, b) => b.count - a.count);
    }, [projects]);

    const statsByType = useMemo(() => {
        const counts: Record<ProjectType, number> = {
            'Tender': 0,
            'Non-Tender': 0,
            'Swakelola': 0
        };
        projects.forEach(p => {
            if (counts[p.type] !== undefined) {
                counts[p.type]++;
            }
        });
        return Object.entries(counts)
            .map(([type, count]) => ({ type: type as ProjectType, count }))
            .filter(item => item.count > 0)
            .sort((a, b) => b.count - a.count);
    }, [projects]);
    
    const totalProjects = projects.length;
    const maxStatusCount = statsByStatus.length > 0 ? statsByStatus[0].count : 0;
    const maxTypeCount = statsByType.length > 0 ? statsByType[0].count : 0;
    
    if (totalProjects === 0) {
        return (
             <div className="bg-white rounded-lg shadow-md p-6 text-center text-slate-500">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Laporan Visual</h3>
                <p>Tidak ada data untuk ditampilkan pada laporan.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Jumlah Paket Berdasarkan Status">
                {statsByStatus.map(({ status, count }) => (
                    <Bar 
                        key={status}
                        label={status}
                        value={count}
                        maxValue={maxStatusCount}
                        color={getStatusColor(status)}
                        percentage={`${((count / totalProjects) * 100).toFixed(1)}%`}
                    />
                ))}
            </ChartCard>
            <ChartCard title="Jumlah Paket Berdasarkan Jenis Pengadaan">
                 {statsByType.map(({ type, count }) => (
                    <Bar 
                        key={type}
                        label={type}
                        value={count}
                        maxValue={maxTypeCount}
                        color={getTypeColor(type)}
                        percentage={`${((count / totalProjects) * 100).toFixed(1)}%`}
                    />
                ))}
            </ChartCard>
        </div>
    );
};

export default ReportCharts;
