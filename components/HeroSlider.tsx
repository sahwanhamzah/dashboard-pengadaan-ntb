import React, { useState, useEffect, useCallback } from 'react';
import { Project, ProjectStatus } from '../types';

interface HeroSliderProps {
    projects: Project[];
    onSelectProject: (id: number) => void;
}

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case 'Selesai': return 'bg-green-500/80';
        case 'Dalam Proses': return 'bg-blue-500/80';
        case 'Ditunda': return 'bg-yellow-500/80';
        case 'Beresiko': return 'bg-red-500/80';
        case 'Perencanaan': return 'bg-slate-500/80';
        default: return 'bg-gray-500/80';
    }
};

const HeroSlider: React.FC<HeroSliderProps> = ({ projects, onSelectProject }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex === projects.length - 1 ? 0 : prevIndex + 1));
    }, [projects.length]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? projects.length - 1 : prevIndex - 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    if (!projects || projects.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full h-[60vh] max-h-[500px] overflow-hidden group">
            <div
                className="w-full h-full flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {projects.map((project) => (
                    <div key={project.id} className="w-full h-full flex-shrink-0 relative">
                        <img src={project.imageUrl || 'https://i.imgur.com/jGTEG3D.jpeg'} alt={project.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                            <span className={`absolute top-4 left-8 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white ${getStatusColor(project.status)}`}>
                                {project.status}
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg">{project.name}</h2>
                            <p className="mt-2 text-lg text-slate-200 drop-shadow-md">{project.location}</p>
                            <button
                                onClick={() => onSelectProject(project.id)}
                                className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                            >
                                Lihat Detail Paket
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button onClick={prevSlide} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Position Indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2">
                {projects.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
