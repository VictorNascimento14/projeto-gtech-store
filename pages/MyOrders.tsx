
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Package, Truck, ChevronRight, X, MapPin, CheckCircle2, Circle, Building2, Home, AlertTriangle, Ban, Loader2, Clock, Navigation, PackageCheck, ExternalLink, ThumbsUp, Gift, Star, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { Order, CartItem } from '../types';

const MyOrders: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const { orders, updateOrderStatus } = useProducts();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showConfirmDeliveryModal, setShowConfirmDeliveryModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<CartItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

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

  // Funções para o modal de cancelamento
  const handleOpenCancelModal = () => {
    setShowCancelModal(true);
    setCancelReason('');
    setCancelSuccess(false);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason('');
    setCancelSuccess(false);
  };

  // Funções para o modal de rastreamento
  const handleOpenTrackingModal = (order: Order) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  const closeTrackingModal = () => {
    setShowTrackingModal(false);
  };

  // Função para obter histórico detalhado de rastreamento
  const getDetailedTrackingHistory = (order: Order) => {
    const baseDate = new Date(order.createdAt);
    const statusProgress: Record<Order['status'], number> = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };
    const currentProgress = statusProgress[order.status];

    const history = [
      {
        id: 1,
        title: 'Pedido Confirmado',
        description: 'Seu pedido foi recebido e está sendo preparado',
        location: 'Sistema GTech Store',
        date: baseDate.toLocaleDateString('pt-BR'),
        time: baseDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        completed: currentProgress >= 0
      },
      {
        id: 2,
        title: 'Pagamento Aprovado',
        description: 'Pagamento confirmado via ' + order.paymentMethod,
        location: 'Sistema GTech Store',
        date: new Date(baseDate.getTime() + 3600000).toLocaleDateString('pt-BR'),
        time: new Date(baseDate.getTime() + 3600000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        completed: currentProgress >= 0
      },
      {
        id: 3,
        title: 'Em Separação',
        description: 'Produto sendo separado no centro de distribuição',
        location: 'CD Guarulhos - Av. Industrial, 1500',
        date: new Date(baseDate.getTime() + 43200000).toLocaleDateString('pt-BR'),
        time: new Date(baseDate.getTime() + 43200000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        completed: currentProgress >= 1
      },
      {
        id: 4,
        title: 'Coletado pela Transportadora',
        description: 'Pacote coletado e em trânsito para o hub regional',
        location: 'CD Guarulhos - SP',
        date: new Date(baseDate.getTime() + 86400000).toLocaleDateString('pt-BR'),
        time: '08:30',
        completed: currentProgress >= 2
      },
      {
        id: 5,
        title: 'Em Trânsito',
        description: 'Pacote em deslocamento para a cidade de destino',
        location: 'Rod. Presidente Dutra, Km 225 - São José dos Campos',
        date: new Date(baseDate.getTime() + 129600000).toLocaleDateString('pt-BR'),
        time: '14:45',
        completed: currentProgress >= 2
      },
      {
        id: 6,
        title: 'Saiu para Entrega',
        description: 'Pacote com o entregador, a caminho do destino',
        location: 'Base local de distribuição',
        date: new Date(baseDate.getTime() + 172800000).toLocaleDateString('pt-BR'),
        time: '09:00',
        completed: currentProgress >= 3
      },
      {
        id: 7,
        title: 'Entregue',
        description: 'Pedido entregue com sucesso',
        location: order.shippingAddress,
        date: new Date(baseDate.getTime() + 190800000).toLocaleDateString('pt-BR'),
        time: '15:23',
        completed: currentProgress >= 3
      }
    ];

    return history;
  };

  // Funções para o modal de confirmação de entrega
  const handleOpenConfirmDeliveryModal = () => {
    setShowConfirmDeliveryModal(true);
    setDeliveryConfirmed(false);
  };

  const closeConfirmDeliveryModal = () => {
    setShowConfirmDeliveryModal(false);
    setDeliveryConfirmed(false);
  };

  // Funções para o modal de avaliação
  const handleOpenReviewModal = (item: CartItem) => {
    setSelectedProductForReview(item);
    setShowReviewModal(true);
    setReviewRating(5);
    setReviewComment('');
    setReviewSubmitted(false);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProductForReview(null);
    setReviewRating(5);
    setReviewComment('');
    setReviewSubmitted(false);
    setHoveredStar(0);
  };

  const handleSubmitReview = async () => {
    if (!selectedProductForReview || !reviewComment.trim()) return;
    
    setIsSubmittingReview(true);
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Criar a avaliação
    const review = {
      id: Date.now(),
      productId: selectedProductForReview.productId,
      author: user?.name || 'Usuário',
      avatar: user?.name?.charAt(0).toUpperCase() || 'U',
      rating: reviewRating,
      date: 'Agora',
      text: reviewComment,
      avatarColor: 'from-primary to-primary-hover',
      likes: 0,
      likedBy: [],
      replies: [],
      createdAt: new Date().toISOString()
    };
    
    // Salvar no localStorage para ser carregado no ProductDetail
    const existingReviews = JSON.parse(localStorage.getItem('productReviews') || '[]');
    existingReviews.push(review);
    localStorage.setItem('productReviews', JSON.stringify(existingReviews));
    
    setIsSubmittingReview(false);
    setReviewSubmitted(true);
    
    // Fechar modal após 2 segundos
    setTimeout(() => {
      closeReviewModal();
    }, 2000);
  };

  const handleConfirmDelivery = async () => {
    if (!selectedOrder) return;
    
    setIsConfirmingDelivery(true);
    try {
      await updateOrderStatus(selectedOrder.id, 'delivered');
      setDeliveryConfirmed(true);
      // Atualizar o pedido selecionado localmente
      setSelectedOrder(prev => prev ? { ...prev, status: 'delivered' } : null);
      
      // Fechar modais após 2.5 segundos
      setTimeout(() => {
        closeConfirmDeliveryModal();
        closeDetailsModal();
      }, 2500);
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
    } finally {
      setIsConfirmingDelivery(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) return;
    
    setIsCancelling(true);
    try {
      await updateOrderStatus(selectedOrder.id, 'cancelled');
      setCancelSuccess(true);
      // Atualizar o pedido selecionado localmente
      setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
      
      // Fechar modais após 2 segundos
      setTimeout(() => {
        closeCancelModal();
        closeDetailsModal();
      }, 2000);
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
    } finally {
      setIsCancelling(false);
    }
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
                <button 
                  onClick={() => handleOpenTrackingModal(order)}
                  className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700"
                >
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

              {/* Botões de Ação */}
              {selectedOrder.status !== 'cancelled' && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                  {/* Botão Rastrear Entrega */}
                  {selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => {
                        closeDetailsModal();
                        setTimeout(() => handleOpenTrackingModal(selectedOrder), 100);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                    >
                      <Truck className="w-5 h-5" />
                      Rastrear Entrega
                    </button>
                  )}

                  {/* Botão Confirmar Entrega */}
                  {(selectedOrder.status === 'shipped' || selectedOrder.status === 'processing') && (
                    <button
                      onClick={handleOpenConfirmDeliveryModal}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                    >
                      <PackageCheck className="w-5 h-5" />
                      Confirmar Recebimento
                    </button>
                  )}
                  
                  {/* Botão Cancelar */}
                  {selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={handleOpenCancelModal}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold py-3 px-4 rounded-xl transition-colors border border-red-200 dark:border-red-800"
                    >
                      <Ban className="w-5 h-5" />
                      Cancelar Pedido e Solicitar Reembolso
                    </button>
                  )}
                </div>
              )}

              {/* Seção de Avaliação - Apenas para pedidos entregues */}
              {selectedOrder.status === 'delivered' && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Avaliar Produtos
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Sua opinião é muito importante! Avalie os produtos que você recebeu.
                  </p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center p-1">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">{item.name}</p>
                        </div>
                        <button
                          onClick={() => handleOpenReviewModal(item)}
                          className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Avaliar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento de Pedido */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={!isCancelling ? closeCancelModal : undefined}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
            {cancelSuccess ? (
              // Tela de sucesso
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Pedido Cancelado</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Seu pedido foi cancelado com sucesso. O reembolso será processado em até 7 dias úteis.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Cancelar Pedido</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pedido #{selectedOrder.id}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      <strong>Atenção:</strong> Ao cancelar o pedido, o reembolso será processado em até 7 dias úteis para o mesmo método de pagamento utilizado na compra.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Motivo do cancelamento *
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Por favor, informe o motivo do cancelamento..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Valor a ser reembolsado:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        R$ {selectedOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                  <button
                    onClick={closeCancelModal}
                    disabled={isCancelling}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling || !cancelReason.trim()}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <Ban className="w-5 h-5" />
                        Confirmar Cancelamento
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Rastreamento Detalhado */}
      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeTrackingModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Rastrear Entrega</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pedido #{selectedOrder.id}</p>
                  </div>
                </div>
                <button 
                  onClick={closeTrackingModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex items-center gap-3">
                <div className={`text-xs font-bold text-white px-3 py-1 rounded-full uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </div>
                {selectedOrder.status === 'shipped' && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Previsão: {new Date(new Date(selectedOrder.createdAt).getTime() + 259200000).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {selectedOrder.status === 'cancelled' ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                  <Ban className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-600 dark:text-red-400 font-medium">Este pedido foi cancelado</p>
                  <p className="text-sm text-red-500 dark:text-red-500 mt-1">O rastreamento não está mais disponível</p>
                </div>
              ) : (
                <>
                  {/* Código de Rastreamento */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Código de Rastreamento</p>
                        <p className="text-lg font-mono font-bold text-gray-800 dark:text-white mt-1">
                          GT{selectedOrder.id.toString().padStart(8, '0')}BR
                        </p>
                      </div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(`GT${selectedOrder.id.toString().padStart(8, '0')}BR`)}
                        className="text-primary hover:text-primary-hover text-sm font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Timeline Detalhada */}
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Histórico de Movimentação</h3>
                  <div className="relative">
                    {getDetailedTrackingHistory(selectedOrder).map((event, index, arr) => (
                      <div key={event.id} className="flex gap-4 mb-0">
                        {/* Timeline */}
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            event.completed 
                              ? 'bg-green-500 border-green-500' 
                              : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                          }`}>
                            {event.completed && (
                              <CheckCircle2 className="w-3 h-3 text-white -mt-0.5 -ml-0.5" />
                            )}
                          </div>
                          {index < arr.length - 1 && (
                            <div className={`w-0.5 h-20 ${
                              event.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                            }`} />
                          )}
                        </div>
                        
                        {/* Event Info */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={`font-semibold ${
                                event.completed 
                                  ? 'text-gray-800 dark:text-white' 
                                  : 'text-gray-400'
                              }`}>
                                {event.title}
                              </h4>
                              <p className={`text-sm mt-0.5 ${
                                event.completed 
                                  ? 'text-gray-500 dark:text-gray-400' 
                                  : 'text-gray-400 dark:text-gray-600'
                              }`}>
                                {event.description}
                              </p>
                              <p className={`text-xs mt-1 flex items-center gap-1 ${
                                event.completed 
                                  ? 'text-gray-400' 
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}>
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            </div>
                            {event.completed && (
                              <div className="text-right text-xs text-gray-400">
                                <p>{event.date}</p>
                                <p>{event.time}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Endereço de Entrega */}
                  <div className="mt-6 bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-primary uppercase tracking-wider font-semibold">Endereço de Entrega</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{selectedOrder.shippingAddress}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Entrega */}
      {showConfirmDeliveryModal && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={!isConfirmingDelivery ? closeConfirmDeliveryModal : undefined}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {deliveryConfirmed ? (
              // Tela de sucesso
              <div className="p-8 text-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 left-0 right-0 flex justify-center">
                    <span className="text-4xl animate-bounce">🎉</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Entrega Confirmada!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Obrigado por confirmar o recebimento do seu pedido. Esperamos que você aproveite sua compra!
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    💡 <strong>Dica:</strong> Avalie os produtos para ajudar outros compradores!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Header com ilustração */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-center text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PackageCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">Confirmar Recebimento</h3>
                  <p className="text-green-100 text-sm mt-1">Pedido #{selectedOrder.id}</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Você está confirmando que recebeu o(s) produto(s) do pedido em perfeito estado.
                  </p>

                  {/* Produtos do pedido */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Itens do Pedido</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center p-1">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">Qtd: {item.quantity}</p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 text-center">
                      ⚠️ Após confirmar, você não poderá mais cancelar este pedido
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                  <button
                    onClick={closeConfirmDeliveryModal}
                    disabled={isConfirmingDelivery}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleConfirmDelivery}
                    disabled={isConfirmingDelivery}
                    className="flex-1 py-3 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isConfirmingDelivery ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-5 h-5" />
                        Confirmar
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Avaliação de Produto */}
      {showReviewModal && selectedProductForReview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={!isSubmittingReview ? closeReviewModal : undefined}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {reviewSubmitted ? (
              // Tela de sucesso
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Avaliação Enviada!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Obrigado por compartilhar sua opinião. Sua avaliação ajuda outros compradores!
                </p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-br from-primary to-primary-hover p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2">
                      <img 
                        src={selectedProductForReview.image} 
                        alt={selectedProductForReview.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Avaliar produto</p>
                      <h3 className="text-lg font-bold">{selectedProductForReview.name}</h3>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Seleção de Estrelas */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Qual sua nota para este produto?
                    </label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 transition-colors ${
                              star <= (hoveredStar || reviewRating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {reviewRating === 1 && 'Péssimo'}
                      {reviewRating === 2 && 'Ruim'}
                      {reviewRating === 3 && 'Regular'}
                      {reviewRating === 4 && 'Bom'}
                      {reviewRating === 5 && 'Excelente'}
                    </p>
                  </div>

                  {/* Campo de Comentário */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Conte-nos sobre sua experiência *
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="O que você achou do produto? Compartilhe detalhes sobre qualidade, tamanho, conforto..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {reviewComment.length}/500 caracteres
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                  <button
                    onClick={closeReviewModal}
                    disabled={isSubmittingReview}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || !reviewComment.trim()}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar Avaliação
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
