import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectType } from '../types';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (project: Project) => void;
  projectToEdit: Project | null;
}

const allStatuses: ProjectStatus[] = ['Perencanaan', 'Dalam Proses', 'Selesai', 'Ditunda', 'Beresiko'];
const allTypes: ProjectType[] = ['Tender', 'Non-Tender', 'Swakelola'];

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, onUpdateProject, projectToEdit }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [budget, setBudget] = useState('');
  const [hps, setHps] = useState('');
  const [realization, setRealization] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Perencanaan');
  const [type, setType] = useState<ProjectType>('Tender');
  const [providerName, setProviderName] = useState('');
  const [providerAddress, setProviderAddress] = useState('');
  const [opdName, setOpdName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setLocation(projectToEdit.location);
      setCoordinates(`${projectToEdit.coordinates.lintang}, ${projectToEdit.coordinates.bujur}`);
      setBudget(projectToEdit.budget.toString());
      setHps(projectToEdit.hps.toString());
      setRealization(projectToEdit.realization.toString());
      setStatus(projectToEdit.status);
      setType(projectToEdit.type);
      setProviderName(projectToEdit.providerName);
      setProviderAddress(projectToEdit.providerAddress);
      setOpdName(projectToEdit.opdName);
      setImageUrl(projectToEdit.imageUrl || '');
    } else {
        // Reset form when there's no project to edit or modal is closed
        setName('');
        setLocation('');
        setCoordinates('');
        setBudget('');
        setHps('');
        setRealization('');
        setStatus('Perencanaan');
        setType('Tender');
        setProviderName('');
        setProviderAddress('');
        setOpdName('');
        setImageUrl('');
    }
    setError('');
  }, [projectToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectToEdit) return;

    // General check for empty required fields
    if (!name || !location || coordinates.trim() === '' || budget.trim() === '' || hps.trim() === '' || realization.trim() === '' || !providerName || !providerAddress || !opdName) {
      setError('Semua kolom wajib diisi, kecuali URL Gambar.');
      return;
    }

    const parts = coordinates.split(',').map(part => part.trim());
    if (parts.length !== 2) {
      setError('Format koordinat tidak valid. Gunakan format "latitude, longitude".');
      return;
    }

    const latNum = Number(parts[0]);
    const lngNum = Number(parts[1]);

    if (!isFinite(latNum) || !isFinite(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
        setError('Koordinat tidak valid. Pastikan Latitude antara -90 dan 90, dan Longitude antara -180 dan 180.');
        return;
    }
    
    // Strict validation for currency values
    const budgetNum = Number(budget);
    const hpsNum = Number(hps);
    const realizationNum = Number(realization);

    if (!isFinite(budgetNum) || !isFinite(hpsNum) || !isFinite(realizationNum)) {
        setError('Pagu, HPS, dan Realisasi harus berupa angka yang valid.');
        return;
    }
    
    setError('');

    const updatedProject: Project = {
      ...projectToEdit,
      name,
      location,
      type,
      coordinates: {
        lintang: latNum,
        bujur: lngNum,
      },
      budget: budgetNum,
      hps: hpsNum,
      realization: realizationNum,
      progress: budgetNum > 0 ? Math.round((realizationNum / budgetNum) * 100) : 0,
      status,
      providerName,
      providerAddress,
      opdName,
      imageUrl: imageUrl || undefined,
    };

    onUpdateProject(updatedProject);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-900">Edit Paket Pengadaan</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700">Nama Paket</label>
              <input type="text" id="edit-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="edit-location" className="block text-sm font-medium text-slate-700">Lokasi</label>
              <input type="text" id="edit-location" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>

            <div className="md:col-span-2">
                <label htmlFor="edit-coordinates" className="block text-sm font-medium text-slate-700">Koordinat (Lintang, Bujur)</label>
                <input type="text" id="edit-coordinates" value={coordinates} onChange={e => setCoordinates(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" placeholder="cth: -8.5833, 116.1167"/>
            </div>

            <div>
                <label htmlFor="edit-type" className="block text-sm font-medium text-slate-700">Jenis Paket</label>
                <select id="edit-type" value={type} onChange={e => setType(e.target.value as ProjectType)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                    {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-slate-700">Status Paket</label>
                <select id="edit-status" value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                    {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="edit-budget" className="block text-sm font-medium text-slate-700">Pagu Paket</label>
                <input type="number" id="edit-budget" value={budget} onChange={e => setBudget(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>
            <div>
                <label htmlFor="edit-hps" className="block text-sm font-medium text-slate-700">HPS Paket</label>
                <input type="number" id="edit-hps" value={hps} onChange={e => setHps(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>
            <div>
                <label htmlFor="edit-realization" className="block text-sm font-medium text-slate-700">Realisasi</label>
                <input type="number" id="edit-realization" value={realization} onChange={e => setRealization(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>
          </div>
            
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-opdName" className="block text-sm font-medium text-slate-700">Nama OPD/Dinas</label>
              <input type="text" id="edit-opdName" value={opdName} onChange={e => setOpdName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>

            <div>
              <label htmlFor="edit-providerName" className="block text-sm font-medium text-slate-700">Nama Penyedia</label>
              <input type="text" id="edit-providerName" value={providerName} onChange={e => setProviderName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>

            <div>
              <label htmlFor="edit-providerAddress" className="block text-sm font-medium text-slate-700">Alamat Penyedia</label>
              <input type="text" id="edit-providerAddress" value={providerAddress} onChange={e => setProviderAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>

            <div>
              <label htmlFor="edit-imageUrl" className="block text-sm font-medium text-slate-700">URL Gambar</label>
              <input type="url" id="edit-imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
