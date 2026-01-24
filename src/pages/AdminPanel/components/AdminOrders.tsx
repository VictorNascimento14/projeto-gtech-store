
import React from 'react';
import { AlertTriangle, Package, Truck, CheckCircle, X, ShoppingBag, ChevronDown } from 'lucide-react';
import { Order } from '../../../types';

interface AdminOrdersProps {
    orders: Order[];
    updateOrderStatus: (id: number, status: Order['status']) => void;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, updateOrderStatus }) => {
    const [showCancelModal, setShowCancelModal] = React.useState(false);
    const [orderToCancel, setOrderToCancel] = React.useState<number | null>(null);

    const handleStatusChange = (orderId: number, newStatus: Order['status']) => {
        if (newStatus === 'cancelled') {
            setOrderToCancel(orderId);
            setShowCancelModal(true);
        } else {
            updateOrderStatus(orderId, newStatus);
        }
    };

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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                                        <div>
                                            <span className="text-gray-400 font-bold uppercase tracking-wider">Pagamento:</span>
                                            <div className="text-gray-600 dark:text-gray-300 font-medium mt-1 text-uppercase">{order.paymentMethod}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Alterar Status:</span>
                                            <div className="relative group">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                                    className={`
                                                        w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all duration-300
                                                        shadow-sm hover:shadow-md
                                                        bg-${config.color}-50 dark:bg-${config.color}-900/10 
                                                        text-${config.color}-700 dark:text-${config.color}-300
                                                        border-${config.color}-200 dark:border-${config.color}-800
                                                        group-hover:border-${config.color}-400 dark:group-hover:border-${config.color}-600
                                                        focus:ring-4 focus:ring-${config.color}-500/10 focus:border-${config.color}-500 block w-full
                                                    `}
                                                >
                                                    <option value="pending" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2">🟡 Pedido Recebido</option>
                                                    <option value="processing" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2">🔵 Em Preparação</option>
                                                    <option value="shipped" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2">🟣 Em Transporte</option>
                                                    <option value="delivered" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2">🟢 Entregue</option>
                                                    <option value="cancelled" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2">🔴 Cancelado</option>
                                                </select>
                                                <div className={`
                                                    absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 group-hover:translate-y-[-40%]
                                                    text-${config.color}-500 dark:text-${config.color}-400
                                                `}>
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 font-bold uppercase tracking-wider">Endereço:</span>
                                            <div className="text-gray-600 dark:text-gray-300 font-medium mt-1">{order.shippingAddress}</div>
                                        </div>
                                    </div>
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

            {/* Modal de Confirmação de Cancelamento */}
            {showCancelModal && orderToCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>

                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                            Cancelar Pedido #{orderToCancel}
                        </h3>

                        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                            Tem certeza que deseja cancelar este pedido? Esta ação notificará o cliente e não poderá ser desfeita automaticamente.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setOrderToCancel(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={() => {
                                    updateOrderStatus(orderToCancel, 'cancelled');
                                    setShowCancelModal(false);
                                    setOrderToCancel(null);
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all"
                            >
                                Confirmar Cancelamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
