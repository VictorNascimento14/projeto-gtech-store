
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, CreditCard, Truck, Calendar, Package } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { orders } = useProducts();
    const { user } = useAuth();

    const order = useMemo(() => {
        // Try to match string ID (if purely numeric in URL) or exact match
        return orders.find(o => String(o.id) === id);
    }, [orders, id]);

    if (!order) {
        return (
            <div className="min-h-screen bg-[#F9F8FE] dark:bg-gray-950 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Pedido não encontrado</h2>
                <Link to="/meus-pedidos" className="text-primary hover:underline font-bold">Voltar para meus pedidos</Link>
            </div>
        );
    }

    // Security check (optional, but good practice)
    if (user && order.customerId !== user.id) {
        return (
            <div className="min-h-screen bg-[#F9F8FE] dark:bg-gray-950 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Acesso Negado</h2>
                <Link to="/meus-pedidos" className="text-primary hover:underline font-bold">Voltar para meus pedidos</Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'processing': return 'bg-blue-500';
            case 'shipped': return 'bg-purple-500';
            case 'delivered': return 'bg-green-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pedido Recebido';
            case 'processing': return 'Em Preparação';
            case 'shipped': return 'Em Transporte';
            case 'delivered': return 'Entregue';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F8FE] dark:bg-gray-950 transition-colors py-10">
            <div className="container mx-auto px-4 lg:px-12">
                {/* Breadcrumb / Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <Link to="/meus-pedidos" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-2 text-sm font-bold">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Voltar para Meus Pedidos
                        </Link>
                        <h1 className="text-3xl font-black text-gray-800 dark:text-white">Detalhes do Pedido <span className="text-primary">#{order.id}</span></h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Realizado em {new Date(order.createdAt).toLocaleDateString()} às {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-white font-bold text-sm uppercase tracking-wider shadow-lg ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Order Items */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Itens do Pedido ({order.items.length})
                            </h2>

                            <div className="space-y-6">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 pb-6 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center p-2 border border-gray-100 dark:border-gray-700 shrink-0">
                                            <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800 dark:text-white text-lg">{item.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                {item.color && <span className="mr-3">Cor: {item.color}</span>}
                                                {item.size && <span>Tamanho: {item.size}</span>}
                                            </p>
                                            <div className="flex justify-between items-end mt-2">
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Qtd: <span className="text-gray-800 dark:text-white font-bold">{item.quantity}</span>
                                                </div>
                                                <div className="text-lg font-black text-primary">
                                                    R$ {(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Info & Summary */}
                    <div className="lg:w-[400px] space-y-6">

                        {/* Endereço */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Endereço de Entrega
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                {order.shippingAddress}
                            </p>
                        </div>

                        {/* Pagamento */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-primary" />
                                Pagamento
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 font-medium capitalize">
                                {order.paymentMethod}
                            </p>
                        </div>

                        {/* Resumo Financeiro */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Resumo</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                    <span className="font-bold text-gray-800 dark:text-white">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Frete</span>
                                    <span className="font-bold text-green-500">Grátis</span>
                                </div>
                                <div className="flex justify-between text-lg pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <span className="font-black text-gray-800 dark:text-white">Total</span>
                                    <span className="font-black text-primary">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <Link
                                to={`/rastreio/${order.id}`}
                                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/30 transition-all hover:-translate-y-1"
                            >
                                <Truck className="w-5 h-5" />
                                Rastrear Pedido
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
