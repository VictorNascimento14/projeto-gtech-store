
import React from 'react';
import { X, Target, Truck, Percent, Gift } from 'lucide-react';

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    newCoupon: any;
    setNewCoupon: (coupon: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const CouponModal: React.FC<CouponModalProps> = ({
    isOpen,
    onClose,
    newCoupon,
    setNewCoupon,
    handleSubmit
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-10 border-b dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Gerar Promoção</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Tipo do Cupom</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setNewCoupon({ ...newCoupon, type: 'product', isFreeShipping: false })}
                                className={`flex flex-col items-center gap-2 p-5 rounded-[24px] border-2 transition-all ${newCoupon.type === 'product' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
                            >
                                <Target className="w-6 h-6" />
                                <span className="text-[10px] font-black uppercase">Carrinho</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewCoupon({ ...newCoupon, type: 'shipping' })}
                                className={`flex flex-col items-center gap-2 p-5 rounded-[24px] border-2 transition-all ${newCoupon.type === 'shipping' ? 'border-blue-500 bg-blue-500/5 text-blue-500' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
                            >
                                <Truck className="w-6 h-6" />
                                <span className="text-[10px] font-black uppercase">Entrega</span>
                            </button>
                        </div>
                    </div>

                    {newCoupon.type === 'shipping' && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Modo de Entrega</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNewCoupon({ ...newCoupon, isFreeShipping: false })}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all text-[10px] font-black uppercase ${!newCoupon.isFreeShipping ? 'border-blue-500 bg-blue-500/10 text-blue-600' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                >
                                    <Percent className="w-3.5 h-3.5" />
                                    Desconto %
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewCoupon({ ...newCoupon, isFreeShipping: true, discountPercent: '100' })}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all text-[10px] font-black uppercase ${newCoupon.isFreeShipping ? 'border-green-500 bg-green-500/10 text-green-600' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
                                >
                                    <Gift className="w-3.5 h-3.5" />
                                    Frete Grátis
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="animate-in fade-in duration-300">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Código Alfa</label>
                        <input required value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="EX: SUMMER2025" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 font-black tracking-widest dark:text-white focus:ring-2 focus:ring-primary" />
                    </div>

                    {!newCoupon.isFreeShipping && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Porcentagem de Redução</label>
                            <div className="relative">
                                <input required type="number" min="1" max="100" value={newCoupon.discountPercent} onChange={e => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 dark:text-white font-black focus:ring-2 focus:ring-primary" placeholder="Ex: 15" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-400">%</span>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex gap-6">
                        <button type="button" onClick={onClose} className="flex-grow py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">Voltar</button>
                        <button type="submit" className={`flex-[2] text-white py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 ${newCoupon.type === 'shipping' ? (newCoupon.isFreeShipping ? 'bg-green-500 shadow-green-500/30' : 'bg-blue-500 shadow-blue-500/30') : 'bg-orange-500 shadow-orange-500/30'}`}>
                            {newCoupon.isFreeShipping ? 'Publicar Frete Grátis' : 'Publicar Cupom'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CouponModal;
