
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Package, Truck, ChevronRight, ChevronLeft, X, MapPin, CheckCircle2, Circle, Building2, Home, AlertTriangle, Ban, Loader2, Clock, Navigation, PackageCheck, ExternalLink, ThumbsUp, Gift, Star, Send, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import { Order, CartItem } from '../../types';

const MyOrders: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const { orders, updateOrderStatus, products } = useProducts();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
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
  const [statusFilter, setStatusFilter] = useState<'pending' | 'delivered' | 'cancelled'>('pending');
  const [pendingSubFilter, setPendingSubFilter] = useState<'all' | 'processing' | 'separating' | 'transit' | 'out_for_delivery'>('all');

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

  // Funções para controle do carrossel
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Obter produtos recomendados (excluindo os que já estão nos pedidos do usuário)
  const getRecommendedProducts = () => {
    const orderedProductIds = new Set(
      userOrders.flatMap(order => order.items.map(item => item.productId))
    );

    // Pegar produtos não comprados e embaralhar
    const availableProducts = products.filter(p => !orderedProductIds.has(p.id));

    // Se não houver produtos não comprados, mostrar todos
    const productsToShow = availableProducts.length > 0 ? availableProducts : products;

    // Embaralhar e retornar até 10 produtos
    return [...productsToShow]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
  };

  const recommendedProducts = getRecommendedProducts();

  if (!isLoggedIn) {
    return (
      <div className="w-full overflow-x-hidden">
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center bg-[#F9F8FE] dark:bg-gray-950 transition-colors">
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
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="bg-[#F9F8FE] dark:bg-gray-950 min-h-fit py-10 pb-16 transition-colors">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meus Pedidos</h1>
              <p className="text-gray-500 dark:text-gray-400">Acompanhe seus pedidos em andamento</p>
            </div>
          </div>

          {/* Filtros de Status */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => {
                setStatusFilter('pending');
                setPendingSubFilter('all');
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${statusFilter === 'pending'
                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-yellow-500 hover:text-yellow-500'
                }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusFilter === 'pending' ? 'bg-white' : 'bg-yellow-500'}`}></span>
                Pendentes
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === 'pending' ? 'bg-white/20' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  }`}>
                  {userOrders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped').length}
                </span>
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${statusFilter === 'delivered'
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:text-green-500'
                }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusFilter === 'delivered' ? 'bg-white' : 'bg-green-500'}`}></span>
                Entregues
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === 'delivered' ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  }`}>
                  {userOrders.filter(o => o.status === 'delivered').length}
                </span>
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${statusFilter === 'cancelled'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-red-500 hover:text-red-500'
                }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusFilter === 'cancelled' ? 'bg-white' : 'bg-red-500'}`}></span>
                Cancelados
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === 'cancelled' ? 'bg-white/20' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                  {userOrders.filter(o => o.status === 'cancelled').length}
                </span>
              </span>
            </button>
          </div>

          {/* Sub-filtros para Pendentes */}
          {statusFilter === 'pending' && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setPendingSubFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${pendingSubFilter === 'all'
                  ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                Todos
              </button>
              <button
                onClick={() => setPendingSubFilter('processing')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${pendingSubFilter === 'processing'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600'
                  }`}
              >
                Em processamento
              </button>
              <button
                onClick={() => setPendingSubFilter('separating')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${pendingSubFilter === 'separating'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600'
                  }`}
              >
                Em separação
              </button>
              <button
                onClick={() => setPendingSubFilter('transit')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${pendingSubFilter === 'transit'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600'
                  }`}
              >
                Em trânsito
              </button>
              <button
                onClick={() => setPendingSubFilter('out_for_delivery')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${pendingSubFilter === 'out_for_delivery'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:text-teal-600'
                  }`}
              >
                Saiu para entrega
              </button>
            </div>
          )}

          <div className="space-y-6">
            {userOrders
              .filter(order => {
                if (statusFilter === 'pending') {
                  const isPending = order.status === 'pending' || order.status === 'processing' || order.status === 'shipped';
                  if (!isPending) return false;

                  if (pendingSubFilter === 'all') return true;
                  if (pendingSubFilter === 'processing') return order.status === 'pending';
                  if (pendingSubFilter === 'separating') return order.status === 'processing';
                  if (pendingSubFilter === 'transit') return order.status === 'shipped';
                  if (pendingSubFilter === 'out_for_delivery') return order.status === 'shipped';

                  return true;
                }
                return order.status === statusFilter;
              })
              .map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-800 hover:border-primary/20 transition-all group">
                  {/* FOTOS NO TOPO - Inverted layout */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-2 border border-gray-100 dark:border-gray-700">
                          <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
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
                  </div>

                  {/* INFO NO RODAPÉ - Inverted layout */}
                  <div className="flex flex-wrap justify-between items-center gap-4">
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
                    <div className="space-y-1 text-right">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Total</div>
                      <div className="text-xl font-black text-primary">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>

                    <Link
                      to={`/rastreio/${order.id}`}
                      className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700 ml-auto"
                    >
                      <Truck className="w-5 h-5 text-primary" />
                      Rastrear Entrega
                    </Link>
                  </div>
                </div>
              ))}

            {userOrders.filter(order => {
              if (statusFilter === 'pending') {
                return order.status === 'pending' || order.status === 'processing' || order.status === 'shipped';
              }
              return order.status === statusFilter;
            }).length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {statusFilter === 'pending' && 'Você não possui pedidos pendentes.'}
                    {statusFilter === 'delivered' && 'Você não possui pedidos entregues.'}
                    {statusFilter === 'cancelled' && 'Você não possui pedidos cancelados.'}
                  </p>
                  {statusFilter === 'pending' && (
                    <Link to="/produtos" className="text-primary font-bold hover:underline mt-2 inline-block">Começar a comprar</Link>
                  )}
                </div>
              )}
          </div>

          {/* Seção de Recomendações */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recomendados para você</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Produtos que você pode gostar</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="w-10 h-10 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="w-10 h-10 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Carrossel de Produtos */}
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {recommendedProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/produto/${product.id}`}
                    className="flex-shrink-0 w-64 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                  >
                    <div className="relative h-48 bg-gray-50 dark:bg-gray-800 p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discount && product.discount !== '0%' && (
                        <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                          {product.discount}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-2 truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-primary">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            R$ {product.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-6">
                <Link
                  to="/produtos"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-primary/20"
                >
                  Ver mais produtos
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Detalhes do Pedido */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDetailsModal} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Detalhes do Pedido #{selectedOrder.id}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Realizado em {new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <button onClick={closeDetailsModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
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
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.size && `Tamanho: ${item.size}`} {item.color && `• Cor: ${item.color}`} Qtd: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-primary">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cancelamento */}
        {showCancelModal && selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!isCancelling ? closeCancelModal : undefined} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
              {cancelSuccess ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Pedido Cancelado</h3>
                  <p className="text-gray-500 dark:text-gray-400">Seu pedido foi cancelado com sucesso.</p>
                </div>
              ) : (
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Cancelar Pedido</h3>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-3 border rounded-xl"
                    placeholder="Motivo..."
                  />
                  <div className="mt-4 flex gap-3">
                    <button onClick={closeCancelModal} className="flex-1 p-2 border rounded-lg">Voltar</button>
                    <button onClick={handleCancelOrder} className="flex-1 p-2 bg-red-500 text-white rounded-lg">Confirmar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Review */}
        {showReviewModal && selectedProductForReview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!isSubmittingReview ? closeReviewModal : undefined} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6">
              {reviewSubmitted ? (
                <div className="text-center font-bold">Avaliação Enviada!</div>
              ) : (
                <>
                  <h3 className="font-bold mb-4">Avaliar {selectedProductForReview.name}</h3>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-8 h-8 cursor-pointer ${star <= (hoveredStar || reviewRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                      />
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-2 border rounded-lg mt-4"
                    rows={4}
                  />
                  <button onClick={handleSubmitReview} className="w-full bg-primary text-white p-2 rounded-lg mt-4">Enviar</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal Tracking Detalhado */}
        {showTrackingModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeTrackingModal} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold mb-4">Rastreamento Pedido #{selectedOrder.id}</h2>
              <div className="space-y-4">
                {getDetailedTrackingHistory(selectedOrder).map(event => (
                  <div key={event.id} className="flex gap-4">
                    <div className={`w-4 h-4 rounded-full ${event.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <p className="font-bold">{event.title}</p>
                      <p className="text-sm">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirmação Entrega */}
        {showConfirmDeliveryModal && selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeConfirmDeliveryModal} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-md p-6">
              <h3 className="font-bold mb-4">Confirmar Entrega?</h3>
              <div className="flex gap-4">
                <button onClick={closeConfirmDeliveryModal} className="flex-1 p-2 border rounded-lg">Não</button>
                <button onClick={handleConfirmDelivery} className="flex-1 p-2 bg-green-500 text-white rounded-lg">Sim</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrders;
