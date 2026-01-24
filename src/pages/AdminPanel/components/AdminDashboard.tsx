
import React from 'react';
import { DollarSign, ShoppingBag, CreditCard, Target, TrendingUp, BarChart3, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';
import { Product } from '../../../types';

interface DashboardMetrics {
    revenue: number;
    totalOrders: number;
    avgTicket: number;
    conversionRate: number;
    categoryCount: { name: string; count: number }[];
    topSellers: (Product & { sales: number })[];
    lowSellers: (Product & { sales: number })[];
}

interface AdminDashboardProps {
    metrics: DashboardMetrics;
    productsCount: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ metrics, productsCount }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-green-500/10 text-green-500 p-3 rounded-2xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-green-500 text-[10px] font-black bg-green-500/5 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Faturamento Estimado</h3>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">R$ {metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-500/10 text-blue-500 p-3 rounded-2xl">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <span className="text-blue-500 text-[10px] font-black bg-blue-500/5 px-2 py-1 rounded-full">LIVE</span>
                    </div>
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total de Pedidos</h3>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{metrics.totalOrders}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-500/10 text-purple-500 p-3 rounded-2xl">
                            <CreditCard className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Ticket Médio</h3>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">R$ {metrics.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                            <Target className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Taxa de Conversão</h3>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{metrics.conversionRate}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Top Vendidos */}
                <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden">
                    <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center">
                        <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            Top Performance (Vendidos)
                        </h3>
                    </div>
                    <div className="p-4">
                        {metrics.topSellers.map((product, i) => (
                            <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-all group">
                                <span className="text-lg font-black text-gray-200 dark:text-gray-700 w-6">0{i + 1}</span>
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shrink-0">
                                    <img src={product.image} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                </div>
                                <div className="flex-grow">
                                    <div className="font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors truncate max-w-[200px]">{product.name}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">{product.category}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-gray-800 dark:text-white">{product.sales} vds</div>
                                    <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest">R$ {(product.sales * product.price).toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Saúde do Inventário */}
                <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 p-8">
                    <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-tighter flex items-center gap-2 mb-8">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Mix de Categorias
                    </h3>
                    <div className="space-y-6">
                        {metrics.categoryCount.map(cat => {
                            const percentage = (cat.count / productsCount) * 100;
                            return (
                                <div key={cat.name}>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                        <span>{cat.name}</span>
                                        <span>{cat.count} itens ({Math.round(percentage)}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-1000"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Baixo Giro */}
                <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden">
                    <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center">
                        <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-orange-500" />
                            Alerta: Baixo Giro
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400">Menos de 5 vendas/mês</span>
                    </div>
                    <div className="p-4">
                        {metrics.lowSellers.map((product) => (
                            <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-all">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0">
                                    <img src={product.image} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                </div>
                                <div className="flex-grow">
                                    <div className="font-bold text-gray-800 dark:text-white text-sm truncate">{product.name}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">{product.category}</div>
                                </div>
                                <div className="flex items-center gap-2 text-orange-500 bg-orange-500/5 px-3 py-1 rounded-full">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span className="text-xs font-black">{product.sales}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alerta de Disponibilidade */}
                <div className="bg-primary text-white rounded-[32px] shadow-2xl shadow-primary/20 p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Saúde do Estoque</h3>
                        <p className="text-white/80 font-medium mb-6">Existem itens com grade incompleta (menos de 3 numerações). Recomendamos reposição.</p>
                    </div>
                    <button className="bg-white text-primary font-black py-4 px-8 rounded-2xl uppercase tracking-widest text-xs self-start hover:scale-105 transition-all active:scale-95 shadow-xl z-10 flex items-center gap-2">
                        Gerar Relatório de Compra
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
