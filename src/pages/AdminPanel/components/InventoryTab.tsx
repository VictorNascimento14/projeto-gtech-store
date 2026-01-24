
import React from 'react';
import { Package, Trash2, Edit, CheckCircle, X, Tag, Truck } from 'lucide-react';
import { Product, Coupon } from '../../../types';

interface InventoryTabProps {
    products: Product[];
    coupons: Coupon[];
    editingStockProductId: number | null;
    editingStockValue: number;
    setEditingStockValue: (value: number) => void;
    handleSaveStock: (product: Product) => void;
    handleCancelEditStock: () => void;
    handleEditStock: (product: Product) => void;
    handleDeleteProduct: (id: number) => void;
    handleEditProduct: (product: Product) => void;
    handleDeleteCoupon: (id: number) => void;
}

const InventoryTab: React.FC<InventoryTabProps> = ({
    products,
    coupons,
    editingStockProductId,
    editingStockValue,
    setEditingStockValue,
    handleSaveStock,
    handleCancelEditStock,
    handleEditStock,
    handleDeleteProduct,
    handleEditProduct,
    handleDeleteCoupon
}) => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Estoque Ativo</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-4">Produto</th>
                                <th className="px-8 py-4">Categoria</th>
                                <th className="px-8 py-4">Preço Final</th>
                                <th className="px-8 py-4">Estoque</th>
                                <th className="px-8 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-hidden shrink-0">
                                                <img src={product.image} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" alt={product.name} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700 dark:text-gray-200 text-sm truncate max-w-[150px] group-hover:text-primary transition-colors">{product.name}</span>
                                                <div className="flex gap-1 mt-1">
                                                    {product.availableSizes?.map(s => (
                                                        <span key={s} className="text-[8px] bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-400 font-bold">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{product.category}</td>
                                    <td className="px-8 py-6 font-black text-gray-800 dark:text-white text-sm">
                                        R$ {product.price},00
                                        {product.discount && (
                                            <span className="ml-2 text-[8px] bg-accent-yellow text-gray-800 px-1.5 py-0.5 rounded-full font-black">{product.discount}</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        {editingStockProductId === product.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editingStockValue}
                                                    onChange={(e) => setEditingStockValue(Number(e.target.value))}
                                                    className="w-20 bg-gray-50 dark:bg-gray-800 border-2 border-primary rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSaveStock(product)}
                                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                                                    title="Salvar"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={handleCancelEditStock}
                                                    className="p-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-all"
                                                    title="Cancelar"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-black ${(product.stock || 0) === 0 ? 'text-red-500' :
                                                    (product.stock || 0) < 10 ? 'text-orange-500' :
                                                        'text-green-500'
                                                    }`}>
                                                    {product.stock || 0}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">un</span>
                                                {(product.stock || 0) === 0 && (
                                                    <span className="ml-2 text-[8px] bg-red-50 dark:bg-red-900/20 text-red-600 px-2 py-0.5 rounded-full font-black">SEM ESTOQUE</span>
                                                )}
                                                {(product.stock || 0) > 0 && (product.stock || 0) < 10 && (
                                                    <span className="ml-2 text-[8px] bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-2 py-0.5 rounded-full font-black">BAIXO</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {editingStockProductId !== product.id && (
                                                <button
                                                    onClick={() => handleEditStock(product)}
                                                    title="Editar Estoque"
                                                    className="p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 rounded-xl transition-all"
                                                >
                                                    <Package className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                title="Excluir Produto"
                                                className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                title="Editar Produto Completo"
                                                className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-orange-500 hover:text-white text-orange-500 rounded-xl transition-all"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden h-fit">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Cupons Ativos</h2>
                </div>
                <div className="p-4 space-y-2">
                    {coupons.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <Tag className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">Sem cupons ativos</p>
                        </div>
                    )}
                    {coupons.map(coupon => (
                        <div key={coupon.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-all group">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl transition-colors ${coupon.type === 'shipping' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                    {coupon.type === 'shipping' ? <Truck className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="font-black text-gray-800 dark:text-white text-xs tracking-widest flex items-center gap-2">
                                        {coupon.code}
                                        {coupon.type === 'shipping' && <span className="text-[8px] bg-blue-100 dark:bg-blue-900 text-blue-600 px-1.5 py-0.5 rounded-full uppercase">FRETE</span>}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {coupon.isFreeShipping ? 'FRETE GRÁTIS' : `${coupon.discountPercent}% OFF`}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InventoryTab;
