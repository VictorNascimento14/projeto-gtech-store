
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Package, Truck, ChevronRight, ChevronLeft, X, MapPin, CheckCircle2, Building2, Home, AlertTriangle, Ban, Loader2, Clock, Navigation, PackageCheck, ExternalLink, ThumbsUp, Gift, Star, Send, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
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

  const getDeliveryTrackingInfo = (order: Order) => {
    const statusProgress: Record<Order['status'], number> = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };
    const currentProgress = statusProgress[order.status];
    return [
      { id: 1, title: 'Centro de Distribuição', address: 'Av. Industrial, 1500 - Guarulhos, SP', status: currentProgress >= 0 ? 'completed' : 'pending', date: currentProgress >= 0 ? new Date(order.createdAt).toLocaleDateString() : null, icon: Building2 },
      { id: 2, title: 'Em Trânsito', address: 'Rod. Presidente Dutra, Km 225', status: currentProgress >= 2 ? 'completed' : currentProgress === 1 ? 'current' : 'pending', date: currentProgress >= 1 ? new Date(new Date(order.createdAt).getTime() + 86400000).toLocaleDateString() : null, icon: Truck },
      { id: 3, title: 'Destino Final', address: order.shippingAddress || 'Endereço não informado', status: currentProgress >= 3 ? 'completed' : currentProgress === 2 ? 'current' : 'pending', date: currentProgress >= 3 ? new Date(new Date(order.createdAt).getTime() + 172800000).toLocaleDateString() : 'Previsão: ' + new Date(new Date(order.createdAt).getTime() + 259200000).toLocaleDateString(), icon: Home }
    ];
  };

  const handleViewDetails = (order: Order) => { setSelectedOrder(order); setShowDetailsModal(true); };
  const closeDetailsModal = () => { setShowDetailsModal(false); setSelectedOrder(null); };

  const handleOpenCancelModal = () => { setShowCancelModal(true); setCancelReason(''); setCancelSuccess(false); };
  const closeCancelModal = () => { setShowCancelModal(false); };

  const handleOpenTrackingModal = (order: Order) => { setSelectedOrder(order); setShowTrackingModal(true); };
  const closeTrackingModal = () => { setShowTrackingModal(false); };

  const getDetailedTrackingHistory = (order: Order) => {
    const baseDate = new Date(order.createdAt);
    const statusProgress: Record<Order['status'], number> = { 'pending': 0, 'processing': 1, 'shipped': 2, 'delivered': 3, 'cancelled': -1 };
    const currentProgress = statusProgress[order.status];
    return [
      { id: 1, title: 'Pedido Confirmado', description: 'Recebido e preparado', location: 'Sistema GTech Store', date: baseDate.toLocaleDateString(), time: baseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: currentProgress >= 0 },
      { id: 2, title: 'Pagamento Aprovado', description: 'Confirmado via ' + order.paymentMethod, location: 'Sistema GTech Store', date: new Date(baseDate.getTime() + 3600000).toLocaleDateString(), time: new Date(baseDate.getTime() + 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: currentProgress >= 0 },
      { id: 3, title: 'Em Separação', description: 'Sendo separado no CD', location: 'CD Guarulhos', date: new Date(baseDate.getTime() + 43200000).toLocaleDateString(), time: new Date(baseDate.getTime() + 43200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: currentProgress >= 1 },
      { id: 4, title: 'Coletado', description: 'Coletado pela transportadora', location: 'CD Guarulhos - SP', date: new Date(baseDate.getTime() + 86400000).toLocaleDateString(), time: '08:30', completed: currentProgress >= 2 },
      { id: 5, title: 'Em Trânsito', description: 'A caminho da cidade de destino', location: 'Rod. Presidente Dutra', date: new Date(baseDate.getTime() + 129600000).toLocaleDateString(), time: '14:45', completed: currentProgress >= 2 },
      { id: 6, title: 'Saiu para Entrega', description: 'A caminho do destino', location: 'Base local', date: new Date(baseDate.getTime() + 172800000).toLocaleDateString(), time: '09:00', completed: currentProgress >= 3 },
      { id: 7, title: 'Entregue', description: 'Entregue com sucesso', location: order.shippingAddress, date: new Date(baseDate.getTime() + 190800000).toLocaleDateString(), time: '15:23', completed: currentProgress >= 3 }
    ];
  };

  const handleOpenConfirmDeliveryModal = () => { setShowConfirmDeliveryModal(true); setDeliveryConfirmed(false); };
  const closeConfirmDeliveryModal = () => { setShowConfirmDeliveryModal(false); };

  const handleOpenReviewModal = (item: CartItem) => { setSelectedProductForReview(item); setShowReviewModal(true); setReviewRating(5); setReviewComment(''); setReviewSubmitted(false); };
  const closeReviewModal = () => { setShowReviewModal(false); setSelectedProductForReview(null); setHoveredStar(0); };

  const handleSubmitReview = async () => {
    if (!selectedProductForReview || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const review = { id: Date.now(), productId: selectedProductForReview.productId, author: user?.name || 'Usuário', rating: reviewRating, text: reviewComment, createdAt: new Date().toISOString() };
    const existingReviews = JSON.parse(localStorage.getItem('productReviews') || '[]');
    existingReviews.push(review);
    localStorage.setItem('productReviews', JSON.stringify(existingReviews));
    setIsSubmittingReview(false);
    setReviewSubmitted(true);
    setTimeout(() => { closeReviewModal(); }, 2000);
  };

  const handleConfirmDelivery = async () => {
    if (!selectedOrder) return;
    setIsConfirmingDelivery(true);
    try {
      await updateOrderStatus(selectedOrder.id, 'delivered');
      setDeliveryConfirmed(true);
      setSelectedOrder(prev => prev ? { ...prev, status: 'delivered' } : null);
      setTimeout(() => { closeConfirmDeliveryModal(); closeDetailsModal(); }, 2500);
    } catch (error) { console.error(error); } finally { setIsConfirmingDelivery(false); }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      await updateOrderStatus(selectedOrder.id, 'cancelled');
      setCancelSuccess(true);
      setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
      setTimeout(() => { closeCancelModal(); closeDetailsModal(); }, 2000);
    } catch (error) { console.error(error); } finally { setIsCancelling(false); }
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

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const getRecommendedProducts = () => {
    const orderedProductIds = new Set(userOrders.flatMap(order => order.items.map(item => item.productId)));
    const productsToShow = products.filter(p => !orderedProductIds.has(p.id)) || products;
    return [...productsToShow].sort(() => Math.random() - 0.5).slice(0, 10);
  };

  const recommendedProducts = getRecommendedProducts();

  if (!isLoggedIn) {
    return (
      <div className="w-full overflow-x-hidden">
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center bg-[#F9F8FE] dark:bg-gray-950 transition-colors">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
            <Lock className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold dark:text-white mb-4">Acesso Restrito</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">Faça login para acompanhar seus pedidos.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login" className="bg-primary text-white font-bold py-3 px-12 rounded-xl">Fazer Login</Link>
            <Link to="/signup" className="bg-white dark:bg-gray-900 text-primary border border-primary font-bold py-3 px-12 rounded-xl">Criar Conta</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="bg-[#F9F8FE] dark:bg-gray-950 min-h-screen py-10 transition-colors">
        <div className="container mx-auto px-4 lg:px-12">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meus Pedidos</h1>
              <p className="text-gray-500 dark:text-gray-400">Acompanhe seus pedidos em andamento</p>
            </div>
          </div>

          {/* Filtros de Status */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => { setStatusFilter('pending'); setPendingSubFilter('all'); }} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white dark:bg-gray-900'}`}>Pendentes</button>
            <button onClick={() => setStatusFilter('delivered')} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${statusFilter === 'delivered' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-900'}`}>Entregues</button>
            <button onClick={() => setStatusFilter('cancelled')} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${statusFilter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-900'}`}>Cancelados</button>
          </div>

          <div className="space-y-6">
            {userOrders
              .filter(order => {
                if (statusFilter === 'pending') return order.status === 'pending' || order.status === 'processing' || order.status === 'shipped';
                return order.status === statusFilter;
              })
              .map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-800 hover:border-primary/20 transition-all group">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                    {/* Esquerda: Fotos e Resumo */}
                    <div className="flex items-center gap-4">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-2 border border-gray-100 dark:border-gray-700 shrink-0">
                          <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                          +{order.items.length - 3}
                        </div>
                      )}
                      <div className="min-w-[100px]">
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                          {order.items.length} {order.items.length === 1 ? 'Produto' : 'Produtos'}
                        </div>
                        <button onClick={() => handleViewDetails(order)} className="text-xs text-primary font-bold hover:underline">Ver detalhes</button>
                      </div>
                    </div>

                    {/* Direita: Informações e Ações */}
                    <div className="flex flex-1 flex-wrap items-center justify-between xl:justify-end gap-x-8 gap-y-4 pt-4 xl:pt-0 border-t xl:border-t-0 border-gray-50 dark:border-gray-800">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Pedido</div>
                        <div className="text-sm font-bold text-gray-800 dark:text-white">#{order.id}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Comprado em</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Status</div>
                        <div className={`text-[10px] font-bold text-white px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</div>
                      </div>

                      <div className="space-y-1 text-right min-w-[80px]">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Total</div>
                        <div className="text-lg font-black text-primary">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>

                      <Link
                        to={`/rastreio/${order.id}`}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700"
                      >
                        <Truck className="w-4 h-4 text-primary" />
                        Rastrear
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

            {userOrders.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Você não possui pedidos nesta categoria.</p>
              </div>
            )}
          </div>

          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold dark:text-white">Recomendados para você</h2>
              <div className="flex gap-2">
                <button onClick={() => scrollCarousel('left')} className="p-2 border rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => scrollCarousel('right')} className="p-2 border rounded-full"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {recommendedProducts.map(product => (
                <Link key={product.id} to={`/produto/${product.id}`} className="flex-shrink-0 w-64 bg-white dark:bg-gray-900 rounded-2xl border p-4 shadow-sm">
                  <div className="h-48 mb-4">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-semibold dark:text-white truncate">{product.name}</h3>
                  <p className="text-primary font-bold">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Modais */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDetailsModal} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Detalhes do Pedido #{selectedOrder.id}</h2>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                    <div className="flex-1">
                      <p className="font-semibold dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
              <button onClick={closeDetailsModal} className="mt-6 w-full bg-primary text-white p-3 rounded-xl">Fechar</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrders;
