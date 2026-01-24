
import React from 'react';
import { Plus, Package, Trash2, Image as ImageIcon } from 'lucide-react';
import { HeroSlide } from '../../../types';

interface AdminHeroProps {
    heroSlides: HeroSlide[];
    onNewSlide: () => void;
    onEditSlide: (slide: HeroSlide) => void;
    onDeleteSlide: (id: number) => void;
}

const AdminHero: React.FC<AdminHeroProps> = ({
    heroSlides,
    onNewSlide,
    onEditSlide,
    onDeleteSlide
}) => {
    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden">
                <div className="p-4 lg:p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-white">Slides do Carrossel Hero</h2>
                        <p className="text-xs text-gray-500 mt-1">Gerencie os slides que aparecem no carrossel principal da Home</p>
                    </div>
                    <button
                        onClick={onNewSlide}
                        className="bg-primary hover:bg-primary-hover text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95 text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Slide
                    </button>
                </div>
                <div className="p-3 lg:p-4 space-y-3 lg:space-y-4">
                    {heroSlides.map((slide, index) => (
                        <div key={slide.id} className="flex items-center gap-3 lg:gap-6 p-3 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-all group">
                            <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                                <span className="text-xl lg:text-2xl font-black text-gray-200 dark:text-gray-700 w-6 lg:w-8 shrink-0">{index + 1}</span>
                                <div className="w-16 lg:w-24 h-12 lg:h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                                    <img src={slide.image} className="w-full h-full object-cover" alt={slide.title} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-800 dark:text-white text-xs lg:text-sm truncate">{slide.title}</div>
                                    <div className="text-[10px] lg:text-xs text-gray-400 font-medium mt-1 truncate">{slide.tag}</div>
                                    <div className="text-[10px] lg:text-xs text-primary font-medium mt-1 truncate">{slide.buttonText}</div>
                                </div>
                            </div>
                            <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                    onClick={() => onEditSlide(slide)}
                                    className="p-1.5 lg:p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 rounded-lg transition-all"
                                    title="Editar Slide"
                                >
                                    <Package className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDeleteSlide(slide.id)}
                                    className="p-1.5 lg:p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 rounded-lg transition-all"
                                    title="Excluir Slide"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {heroSlides.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">Nenhum slide cadastrado</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminHero;
