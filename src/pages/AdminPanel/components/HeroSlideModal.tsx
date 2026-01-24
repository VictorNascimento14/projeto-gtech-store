
import React from 'react';
import { X } from 'lucide-react';
import { HeroSlide } from '../../../types';

interface HeroSlideModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingSlide: HeroSlide | null;
    newHeroSlide: any;
    setNewHeroSlide: (slide: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const HeroSlideModal: React.FC<HeroSlideModalProps> = ({
    isOpen,
    onClose,
    editingSlide,
    newHeroSlide,
    setNewHeroSlide,
    handleSubmit
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-10 border-b dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                        {editingSlide ? 'Editar Slide' : 'Novo Slide Hero'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Tag/Etiqueta</label>
                        <input
                            required
                            value={newHeroSlide.tag}
                            onChange={e => setNewHeroSlide({ ...newHeroSlide, tag: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold"
                            placeholder="Ex: Melhores ofertas personalizadas"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Título Principal</label>
                        <input
                            required
                            value={newHeroSlide.title}
                            onChange={e => setNewHeroSlide({ ...newHeroSlide, title: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold"
                            placeholder="Ex: Queima de stoque Nike 🔥"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Descrição</label>
                        <textarea
                            required
                            value={newHeroSlide.description}
                            onChange={e => setNewHeroSlide({ ...newHeroSlide, description: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-medium resize-none"
                            rows={3}
                            placeholder="Descrição do slide"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Texto do Botão</label>
                            <input
                                required
                                value={newHeroSlide.buttonText}
                                onChange={e => setNewHeroSlide({ ...newHeroSlide, buttonText: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold"
                                placeholder="Ex: Ver Ofertas"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Link do Botão</label>
                            <input
                                required
                                value={newHeroSlide.buttonLink}
                                onChange={e => setNewHeroSlide({ ...newHeroSlide, buttonLink: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold"
                                placeholder="Ex: /produtos"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">URL da Imagem do Tênis</label>
                        <input
                            required
                            type="url"
                            value={newHeroSlide.image}
                            onChange={e => setNewHeroSlide({ ...newHeroSlide, image: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-medium"
                            placeholder="https://..."
                        />
                        {newHeroSlide.image && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <p className="text-xs text-gray-400 font-bold mb-2">Preview:</p>
                                <img src={newHeroSlide.image} alt="Preview" className="w-32 h-32 object-contain mx-auto" />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex gap-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-grow py-4 font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-primary hover:bg-primary-hover text-white py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 transition-all active:scale-95"
                        >
                            {editingSlide ? 'Atualizar Slide' : 'Adicionar Slide'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HeroSlideModal;
