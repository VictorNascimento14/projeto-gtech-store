
import React from 'react';
import { AlertTriangle, Package, Truck, CheckCircle, X, ShoppingBag } from 'lucide-react';
import { Order } from '../../../types';

interface AdminOrdersProps {
    orders: Order[];
    updateOrderStatus: (id: number, status: Order['status']) => void;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, updateOrderStatus }) => {
    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Pedidos</h2>
                            <p className="text-xs text-gray-500 mt-1">{orders.length} pedidos no sistema</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                <span className="text-xs font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length} Recebidos</span>
                            </div>
                            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <span className="text-xs font-bold text-blue-600">{orders.filter(o => o.status === 'processing').length} Preparando</span>
                            </div>
                            <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <span className="text-xs font-bold text-purple-600">{orders.filter(o => o.status === 'shipped').length} Transporte</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    {orders.map((order) => {
                        const statusConfig = {
                            pending: { label: 'Pedido Recebido', color: 'yellow', icon: AlertTriangle },
                            processing: { label: 'Em Preparação', color: 'blue', icon: Package },
                            shipped: { label: 'Em Transporte', color: 'purple', icon: Truck },
                            delivered: { label: 'Entregue', color: 'green', icon: CheckCircle },
                            cancelled: { label: 'Cancelado', color: 'red', icon: X }
                        };
                        const config = statusConfig[order.status];
                        const StatusIcon = config.icon;

                        return (
                            <div key={order.id} className="border dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-black text-gray-800 dark:text-white">Pedido #{order.id}</span>
                                            <div className={`flex items-center gap-1 px-3 py-1 bg-${config.color}-50 dark:bg-${config.color}-900/20 rounded-full`}>
                                                <StatusIcon className={`w-3 h-3 text-${config.color}-600`} />
                                                <span className={`text-xs font-bold text-${config.color}-600`}>{config.label}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="text-xs text-gray-400 mt-1">{order.customerEmail}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-primary">
                                            R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium mt-1">
                                            {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t dark:border-gray-800 pt-4 space-y-3">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Itens do Pedido:</div>
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                                <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-gray-800 dark:text-white">{item.name}</div>
                                                <div className="text-xs text-gray-400">
                                                    {item.color} • {item.size} • Qtd: {item.quantity}
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                                R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t dark:border-gray-800 pt-4 mt-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="text-gray-400 font-bold uppercase tracking-wider">Pagamento:</span>
                                            <div className="text-gray-600 dark:text-gray-300 font-medium mt-1 text-uppercase">{order.paymentMethod}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 font-bold uppercase tracking-wider">Endereço:</span>
                                            <div className="text-gray-600 dark:text-gray-300 font-medium mt-1">{order.shippingAddress}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'processing')}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all"
                                        >
                                            Processar Pedido
                                        </button>
                                    )}
                                    {order.status === 'processing' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition-all"
                                        >
                                            Marcar como Enviado
                                        </button>
                                    )}
                                    {order.status === 'shipped' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all"
                                        >
                                            Marcar como Entregue
                                        </button>
                                    )}
                                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 rounded-lg text-xs font-bold transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {orders.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">Nenhum pedido registrado</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
