
import React from 'react';
import { X, PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { CATEGORIES } from '../../../constants';
import { Product } from '../../../types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingProduct: Product | null;
    newProduct: any;
    setNewProduct: (product: any) => void;
    discountPercent: string;
    setDiscountPercent: (value: string) => void;
    selectedSizes: string[];
    toggleSize: (size: string) => void;
    currentSizeOptions: string[];
    extraImageUrl: string;
    setExtraImageUrl: (url: string) => void;
    addExtraImage: () => void;
    removeExtraImage: (index: number) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    editingProduct,
    newProduct,
    setNewProduct,
    discountPercent,
    setDiscountPercent,
    selectedSizes,
    toggleSize,
    currentSizeOptions,
    extraImageUrl,
    setExtraImageUrl,
    addExtraImage,
    removeExtraImage,
    handleSubmit
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-10 border-b dark:border-gray-800">
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                        {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Item'}
                    </h2>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Nome Comercial</label>
                                <input required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold" placeholder="Ex: Tênis Nike Air Max" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Categoria</label>
                                    <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold">
                                        {CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Preço de Tabela (R$)</label>
                                    <input required type="number" value={newProduct.originalPrice} onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Desconto Direto (%)</label>
                                    <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold" />
                                </div>
                                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex flex-col justify-center">
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Preço Sugerido</span>
                                    <span className="text-xl font-black dark:text-white">R$ {newProduct.price.toLocaleString()},00</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Quantidade em Estoque</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={newProduct.stock}
                                    onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold"
                                    placeholder="Ex: 50"
                                />
                                <p className="text-xs text-gray-400 mt-2">Unidades disponíveis para venda</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Grade em Estoque ({newProduct.category})</label>
                                <div className="flex flex-wrap gap-3">
                                    {currentSizeOptions.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`min-w-[48px] h-12 px-3 rounded-xl border-2 text-xs font-black transition-all ${selectedSizes.includes(size) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-gray-100 dark:border-gray-800 text-gray-400 dark:bg-gray-800'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Capa Principal (URL)</label>
                                <input required value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white" placeholder="https://..." />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Galeria Adicional (URL)</label>
                                <div className="flex gap-3">
                                    <input
                                        value={extraImageUrl}
                                        onChange={e => setExtraImageUrl(e.target.value)}
                                        className="flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                                        placeholder="Link da imagem..."
                                    />
                                    <button
                                        type="button"
                                        onClick={addExtraImage}
                                        className="bg-gray-800 dark:bg-gray-700 text-white p-4 rounded-2xl hover:bg-gray-950 transition-all shadow-xl"
                                    >
                                        <PlusCircle className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {newProduct.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {newProduct.images.map((img: string, i: number) => (
                                        <div key={i} className="relative aspect-square bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden group border dark:border-gray-800">
                                            <img src={img} className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal" />
                                            <button
                                                type="button"
                                                onClick={() => removeExtraImage(i)}
                                                className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[200px]">
                                <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Preview em Tempo Real</div>
                                {newProduct.image ? <img src={newProduct.image} className="max-w-full max-h-40 object-contain mix-blend-multiply dark:mix-blend-normal" /> : <ImageIcon className="w-16 h-16 text-gray-200" />}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex gap-6">
                        <button type="button" onClick={onClose} className="flex-grow py-5 font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-[3] bg-primary text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            {editingProduct ? 'Salvar Alterações' : 'Ativar Produto na Loja'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
