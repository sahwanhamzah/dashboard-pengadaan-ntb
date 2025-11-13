import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Project } from '../types';

// Fix for default marker icon issue when not using a bundler like Webpack
// We manually set the paths to the images served by the CDN.
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://aistudiocdn.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://aistudiocdn.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://aistudiocdn.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultIcon = new L.Icon.Default();
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


interface MapViewProps {
  projects: Project[];
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
}

// A component to programmatically change map view when a project is selected
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    // Robust check to ensure center is a valid array of finite numbers before flying.
    if (center && typeof center[0] === 'number' && isFinite(center[0]) && typeof center[1] === 'number' && isFinite(center[1])) {
        map.flyTo(center, zoom, {
            animate: true,
            duration: 0.8
        });
    }
  }, [center, zoom, map]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({ projects, selectedProjectId, onSelectProject }) => {
  // Defensive filter with robust validation to ensure no invalid coordinates (including nulls) ever reach the map.
  const validProjects = projects.filter(p => 
    p && p.coordinates && 
    typeof p.coordinates.lintang === 'number' && isFinite(p.coordinates.lintang) &&
    typeof p.coordinates.bujur === 'number' && isFinite(p.coordinates.bujur)
  );
  
  const selectedProject = validProjects.find(p => p.id === selectedProjectId);

  const calculatedCenter: [number, number] | [null, null] = selectedProject
    ? [selectedProject.coordinates.lintang, selectedProject.coordinates.bujur]
    : [-8.58, 116.12]; // Default center to Mataram, NTB

  // --- FINAL SAFEGUARD ---
  // This is the ultimate defense. Before rendering, we explicitly validate the coordinates one last time.
  // This prevents any possibility of null, NaN, or other invalid values from reaching the Leaflet component,
  // permanently fixing the "Invalid LatLng object" error.
  const mapCenter: [number, number] = (
    Array.isArray(calculatedCenter) &&
    calculatedCenter.length === 2 &&
    typeof calculatedCenter[0] === 'number' && isFinite(calculatedCenter[0]) &&
    typeof calculatedCenter[1] === 'number' && isFinite(calculatedCenter[1])
  ) ? calculatedCenter : [-8.58, 116.12]; // Fallback to a safe default

  const mapZoom = selectedProject ? 13 : 8;

  // By adding a key that changes with the center, we force React to re-mount the entire
  // Leaflet component, preventing it from holding onto invalid internal state.
  const mapKey = `${mapCenter[0]}-${mapCenter[1]}`;
  
  return (
    <MapContainer
      key={mapKey}
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      className="z-0" // To make sure it's under any modals
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* This component will handle flying to the selected project */}
      <ChangeView center={mapCenter} zoom={mapZoom} />

      {validProjects.map(project => (
        <Marker
          key={project.id}
          position={[project.coordinates.lintang, project.coordinates.bujur]}
          icon={project.id === selectedProjectId ? selectedIcon : defaultIcon}
          eventHandlers={{
            click: () => onSelectProject(project.id),
          }}
        >
          <Popup>
            <div className="font-sans">
              <p className="font-bold text-base m-0">{project.name}</p>
              <p className="text-sm text-slate-600 m-0 mt-1">{project.location}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
