import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, ChevronLeft, MapPin, Calendar, Clock, AlertCircle, ClipboardList } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';

const OrderTracking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { orders } = useProducts();

    const order = useMemo(() => {
        return orders.find(o => String(o.id) === id) || null;
    }, [orders, id]);

    if (!order) {
        return (
            <div className="min-h-screen bg-[#F9F8FE] dark:bg-gray-950 flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Pedido não encontrado</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Não conseguimos encontrar o pedido solicitado.</p>
                <Link
                    to="/meus-pedidos"
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition-all"
                >
                    Voltar para Meus Pedidos
                </Link>
            </div>
        );
    }

    // Mapeamento dos steps da timeline
    const steps = [
        {
            id: 1,
            label: 'Pedido recebido',
            icon: ClipboardList,
            activeStatus: ['pending', 'processing', 'shipped', 'delivered'],
            description: 'Recebemos seu pedido e estamos conferindo o pagamento.'
        },
        {
            id: 2,
            label: 'Em preparação',
            icon: Package,
            activeStatus: ['processing', 'shipped', 'delivered'],
            description: 'Seu pedido está sendo separado e embalado.'
        },
        {
            id: 3,
            label: 'Em transporte',
            icon: Truck,
            activeStatus: ['shipped', 'delivered'],
            description: 'Pedido a caminho do endereço de entrega.'
        },
        {
            id: 4,
            label: 'Entregue',
            icon: CheckCircle,
            activeStatus: ['delivered'],
            description: 'Pronto! Seu pedido foi entregue com sucesso.'
        }
    ];

    // Lógica especial para cancelado
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="bg-[#F9F8FE] dark:bg-gray-950 min-h-screen py-8 lg:py-12 transition-colors">
            <div className="container mx-auto px-4 lg:px-12 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/meus-pedidos" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-4 group">
                        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Voltar para pedidos
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Rastrear Entrega</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Pedido <span className="text-primary font-bold">#{order.id}</span></p>
                        </div>
                        {isCancelled && (
                            <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Pedido Cancelado
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline Visual */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 relative overflow-hidden">

                    <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4">
                        {steps.map((step, index) => {
                            const isActive = step.activeStatus.includes(order.status) && !isCancelled;
                            const isCompleted = steps[index + 1]?.activeStatus.includes(order.status) && !isCancelled;

                            const StepIcon = step.icon;

                            return (
                                <div key={step.id} className={`flex md:flex-col items-center gap-4 md:gap-6 relative z-10 group ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                    {/* Círculo do ícone */}
                                    <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center shadow-xl z-20 relative
                    ${isActive || isCompleted
                                            ? 'bg-primary text-white scale-110 shadow-primary/30'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'}
                  `}>
                                        <StepIcon className={`w-8 h-8 ${isActive && !isCompleted ? 'animate-bounce' : ''}`} />
                                    </div>

                                    {/* Texto */}
                                    <div className="text-left md:text-center flex-1">
                                        <h3 className={`font-bold text-lg mb-1 transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                            {step.label}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight max-w-[200px] hidden md:block mx-auto">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Linha de conexão (Horizontal - Desktop) */}
                                    {index !== steps.length - 1 && (
                                        <div className={`hidden md:block absolute top-8 left-[50%] w-full h-1 -z-10 transition-colors duration-500 ${isCompleted ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-800'
                                            }`} />
                                    )}

                                    {/* Linha de conexão (Vertical - Mobile) */}
                                    {index !== steps.length - 1 && (
                                        <div className={`absolute left-8 top-16 bottom-[-24px] w-1 md:hidden -ml-0.5 -z-10 transition-colors duration-500 ${isCompleted ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-800'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detalhes da Entrega */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card Endereço */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-bold mb-1">Endereço de Entrega</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    {order.shippingAddress || 'Rua Exemplo, 123 - Centro'}<br />
                                    São Paulo - SP, 01000-000
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card Previsão */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-start gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-green-600 dark:text-green-400">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-bold mb-1">Previsão de Entrega</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                                    Chega até <span className="font-bold text-gray-800 dark:text-gray-200">28 de Janeiro</span>
                                </p>
                                <div className="inline-flex items-center text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Dentro do prazo
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
