
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Package, Truck, ChevronRight, X, MapPin, CheckCircle2, Circle, Building2, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { Order } from '../types';

const MyOrders: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const { orders } = useProducts();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const userOrders = orders.filter(order => order.customerId === user?.id);

  // Função para obter informações de rastreamento da entrega
  const getDeliveryTrackingInfo = (order: Order) => {
    const statusProgress: Record<Order['status'], number> = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };

    const currentProgress = statusProgress[order.status];

    const trackingSteps = [
      {
        id: 1,
        title: 'Centro de Distribuição',
        address: 'Av. Industrial, 1500 - Guarulhos, SP - CEP: 07220-000',
        status: currentProgress >= 0 ? 'completed' : 'pending',
        date: currentProgress >= 0 ? new Date(order.createdAt).toLocaleDateString('pt-BR') : null,
        icon: Building2
      },
      {
        id: 2,
        title: 'Em Trânsito - Filial Regional',
        address: 'Rod. Presidente Dutra, Km 225 - São José dos Campos, SP - CEP: 12240-420',
        status: currentProgress >= 2 ? 'completed' : currentProgress === 1 ? 'current' : 'pending',
        date: currentProgress >= 1 ? new Date(new Date(order.createdAt).getTime() + 86400000).toLocaleDateString('pt-BR') : null,
        icon: Truck
      },
      {
        id: 3,
        title: 'Destino Final',
        address: order.shippingAddress || 'Endereço não informado',
        status: currentProgress >= 3 ? 'completed' : currentProgress === 2 ? 'current' : 'pending',
        date: currentProgress >= 3 ? new Date(new Date(order.createdAt).getTime() + 172800000).toLocaleDateString('pt-BR') : 'Previsão: ' + new Date(new Date(order.createdAt).getTime() + 259200000).toLocaleDateString('pt-BR'),
        icon: Home
      }
    ];

    return trackingSteps;
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

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
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'shipped': return 'Em Trânsito';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center bg-[#F9F8FE] dark:bg-gray-950 transition-colors">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse text-primary">
          <Lock className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Acesso Restrito</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          Para visualizar seus pedidos e acompanhar suas entregas, você precisa estar conectado à sua conta.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/login"
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-12 rounded-xl transition-all shadow-lg shadow-primary/30 uppercase text-sm tracking-widest"
          >
            Fazer Login
          </Link>
          <Link
            to="/signup"
            className="bg-white dark:bg-gray-900 text-primary border border-primary font-bold py-3 px-12 rounded-xl hover:bg-primary/5 transition-all uppercase text-sm tracking-widest"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F8FE] dark:bg-gray-950 min-h-screen py-10 transition-colors">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meus Pedidos</h1>
            <p className="text-gray-500 dark:text-gray-400">Acompanhe seus pedidos em andamento</p>
          </div>
        </div>

        <div className="space-y-6">
          {userOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-800 hover:border-primary/20 transition-all group">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-6 border-b border-gray-50 dark:border-gray-800">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Número do pedido</div>
                  <div className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors">#{order.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Data da compra</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Status</div>
                  <div className={`text-[10px] font-bold text-white px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>
                <div className="space-y-1 text-right ml-auto">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Total</div>
                  <div className="text-xl font-black text-primary">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-2 border border-gray-100 dark:border-gray-700">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-xs font-bold text-gray-500">
                      +{order.items.length - 3}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {order.items.length} {order.items.length === 1 ? 'Produto' : 'Produtos'}
                    </div>
                    <button 
                      onClick={() => handleViewDetails(order)}
                      className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      Ver detalhes <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700">
                  <Truck className="w-5 h-5 text-primary" />
                  Rastrear Entrega
                </button>
              </div>
            </div>
          ))}

          {userOrders.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Você não possui pedidos em andamento.</p>
              <Link to="/produtos" className="text-primary font-bold hover:underline mt-2 inline-block">Começar a comprar</Link>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Pedido */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeDetailsModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Detalhes do Pedido #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Realizado em {new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button 
                onClick={closeDetailsModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Produtos do Pedido */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Produtos</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center p-2">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.size && `Tamanho: ${item.size}`} {item.color && `• Cor: ${item.color}`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-primary">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status e Rastreamento */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Rastreamento da Entrega
                </h3>
                
                {selectedOrder.status === 'cancelled' ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">Este pedido foi cancelado</p>
                  </div>
                ) : (
                  <div className="relative">
                    {getDeliveryTrackingInfo(selectedOrder).map((step, index, arr) => (
                      <div key={step.id} className="flex gap-4 mb-6 last:mb-0">
                        {/* Timeline Line and Icon */}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.status === 'completed' 
                              ? 'bg-green-500 text-white' 
                              : step.status === 'current'
                              ? 'bg-primary text-white animate-pulse'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                          }`}>
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <step.icon className="w-5 h-5" />
                            )}
                          </div>
                          {index < arr.length - 1 && (
                            <div className={`w-0.5 h-16 ${
                              step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                            }`} />
                          )}
                        </div>
                        
                        {/* Step Info */}
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold ${
                              step.status === 'completed' 
                                ? 'text-green-600 dark:text-green-400' 
                                : step.status === 'current'
                                ? 'text-primary'
                                : 'text-gray-400'
                            }`}>
                              {step.title}
                            </h4>
                            {step.status === 'current' && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                Em andamento
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{step.address}</p>
                          {step.date && (
                            <p className="text-xs text-gray-400 mt-1">{step.date}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumo */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total do Pedido</span>
                  <span className="text-2xl font-black text-primary">
                    R$ {selectedOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
