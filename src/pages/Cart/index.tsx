
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Minus, Plus, Tag, Truck, X, CheckCircle,
  AlertCircle, MapPin, Loader2, Info, TrendingDown,
  CreditCard, QrCode, FileText, ChevronRight, Lock,
  ArrowRight, Check
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { Coupon } from '../types';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { coupons, createOrder } = useProducts();
  const { isLoggedIn, user } = useAuth();

  // Estados de Cupom
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Estados de Frete
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<{ logradouro: string; bairro: string; uf: string } | null>(null);
  const [baseShippingValue, setBaseShippingValue] = useState<number | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  // Estados de Checkout
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto' | null>(null);
  const [installments, setInstallments] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'success'>('selection');

  const isEmpty = items.length === 0;
  const isFreeShippingByValue = subtotal >= 500;

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const totalOriginalValue = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  }, [items]);

  const totalItemsDiscount = useMemo(() => {
    return totalOriginalValue - subtotal;
  }, [totalOriginalValue, subtotal]);

  useEffect(() => {
    const fetchCep = async () => {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        setIsLoadingCep(true);
        setCepError('');
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await response.json();
          if (data.erro) {
            setCepError('CEP não encontrado.');
            setAddress(null);
            setBaseShippingValue(null);
          } else {
            setAddress({ logradouro: data.logradouro, bairro: data.bairro, uf: data.uf });
            calculateBaseShipping(data.uf);
          }
        } catch (error) {
          setCepError('Erro ao buscar CEP.');
        } finally {
          setIsLoadingCep(false);
        }
      } else {
        setAddress(null);
        setBaseShippingValue(null);
      }
    };
    fetchCep();
  }, [cep]);

  const calculateBaseShipping = (uf: string) => {
    const sudeste = ['SP', 'RJ', 'MG', 'ES'];
    const sul = ['PR', 'SC', 'RS'];
    if (sudeste.includes(uf)) setBaseShippingValue(15);
    else if (sul.includes(uf)) setBaseShippingValue(25);
    else setBaseShippingValue(45);
  };

  const couponDiscountValue = useMemo(() => {
    if (!appliedCoupon || appliedCoupon.type !== 'product') return 0;
    return items.reduce((sum, item) => {
      const hasOriginalDiscount = item.price < item.originalPrice;
      if (!appliedCoupon.stackable && hasOriginalDiscount) return sum;
      return sum + (item.price * (appliedCoupon.discountPercent / 100)) * item.quantity;
    }, 0);
  }, [appliedCoupon, items]);

  const finalShippingValue = useMemo(() => {
    if (baseShippingValue === null) return 0;
    if (isFreeShippingByValue) return 0;
    if (appliedCoupon?.type === 'shipping' && appliedCoupon.isFreeShipping) return 0;
    if (appliedCoupon?.type === 'shipping' && appliedCoupon.discountPercent > 0) {
      const discountAmount = (baseShippingValue * (appliedCoupon.discountPercent / 100));
      return Math.max(0, baseShippingValue - discountAmount);
    }
    return baseShippingValue;
  }, [baseShippingValue, isFreeShippingByValue, appliedCoupon]);

  const shippingDiscountValue = useMemo(() => {
    if (baseShippingValue === null) return 0;
    return Math.max(0, baseShippingValue - finalShippingValue);
  }, [baseShippingValue, finalShippingValue]);

  // Subtotal com cupons e descontos de itens, mas sem frete e sem desconto de método de pagamento
  const intermediateTotal = useMemo(() => {
    return Math.max(0, subtotal + finalShippingValue - couponDiscountValue);
  }, [subtotal, finalShippingValue, couponDiscountValue]);

  // Desconto de 5% se for PIX
  const pixDiscountAmount = useMemo(() => {
    if (paymentMethod === 'pix') {
      return intermediateTotal * 0.05;
    }
    return 0;
  }, [paymentMethod, intermediateTotal]);

  const totalFinalCheckout = intermediateTotal - pixDiscountAmount;

  const handleApplyCoupon = () => {
    setCouponError('');
    const found = coupons.find(c => c.code === couponCode.toUpperCase().trim());
    if (found) {
      setAppliedCoupon(found);
      setCouponCode('');
    } else {
      setCouponError('Cupom inválido ou expirado');
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (baseShippingValue === null && !isFreeShippingByValue) {
      alert("Por favor, informe seu CEP para calcular o frete antes de finalizar.");
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const confirmPurchase = async () => {
    if (!paymentMethod || !user) return;

    setIsProcessing(true);

    try {
      await createOrder({
        customerId: user.id || null,
        customerName: user.name || user.email?.split('@')[0] || 'Cliente',
        customerEmail: user.email || '',
        total: totalFinalCheckout,
        status: 'pending',
        paymentMethod: paymentMethod,
        shippingAddress: address ? `${address.logradouro}, ${address.bairro} - ${address.uf}` : 'Endereço não informado',
        items: items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          originalPrice: item.originalPrice,
          color: item.color,
          size: item.size,
          quantity: item.quantity
        }))
      });

      setCheckoutStep('success');
      clearCart();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Houve um erro ao processar seu pedido. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#F9F8FE] dark:bg-gray-950 min-h-screen py-10 transition-colors">
      <div className="container mx-auto px-4 lg:px-12">
        {isEmpty ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px] border border-transparent dark:border-gray-800">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-300 dark:text-gray-700">
              <ShoppingCart className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Seu carrinho está vazio</h2>
            <Link to="/produtos" className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-primary/30 uppercase text-sm tracking-widest">Ir para as compras</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-800">
                <div className="grid grid-cols-12 gap-4 pb-4 mb-4 border-b border-gray-100 dark:border-gray-800 hidden md:grid">
                  <div className="col-span-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase">Meu Carrinho</div>
                  <div className="col-span-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase text-center">Quantidade</div>
                  <div className="col-span-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase text-center">Unitário</div>
                  <div className="col-span-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase text-center">Total</div>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4 border-b border-gray-50 dark:border-gray-800">
                    <div className="md:col-span-6 flex gap-4">
                      <div className="w-20 h-20 bg-[#E2E3FF]/30 dark:bg-gray-800 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                        <img alt={item.name} className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal" src={item.image} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-gray-800 dark:text-white text-md leading-tight">{item.name}</h3>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">{item.color} • TAM {item.size}</div>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex flex-col items-center">
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg h-8 bg-white dark:bg-gray-800">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="px-3 font-bold text-gray-700 dark:text-gray-200 text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-[10px] text-red-400 font-bold mt-1 hover:underline">Remover</button>
                    </div>

                    <div className="md:col-span-2 text-center">
                      <div className="flex flex-col items-center">
                        {item.originalPrice > item.price && (
                          <span className="text-[10px] text-gray-400 line-through font-medium">R$ {formatPrice(item.originalPrice)}</span>
                        )}
                        <div className="font-bold text-gray-800 dark:text-white text-sm">R$ {formatPrice(item.price)}</div>
                      </div>
                    </div>

                    <div className="md:col-span-2 text-center font-bold text-gray-800 dark:text-white text-sm">R$ {formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-6 border-t border-gray-50 dark:border-gray-800">
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300 text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <Tag className="w-4 h-4 text-primary" /> Cupom de desconto
                    </h4>
                    {!appliedCoupon ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value)}
                            className="flex-grow bg-[#F5F5F5] dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary dark:text-white font-bold tracking-widest"
                            placeholder="CÓDIGO"
                          />
                          <button onClick={handleApplyCoupon} className="bg-primary text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">OK</button>
                        </div>
                        {couponError && <p className="text-red-500 text-[10px] font-bold px-1">{couponError}</p>}
                      </div>
                    ) : (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="text-xs font-black tracking-widest text-green-600">{appliedCoupon.code}</div>
                            <div className="text-[10px] font-bold text-green-500">{appliedCoupon.discountPercent}% OFF</div>
                          </div>
                        </div>
                        <button onClick={() => setAppliedCoupon(null)} className="p-2 text-green-600 hover:bg-green-500/20 rounded-full"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300 text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <Truck className="w-4 h-4 text-primary" /> Frete e Entrega
                    </h4>
                    <input
                      value={cep}
                      onChange={e => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="CEP: 00000-000"
                      className="w-full bg-[#F5F5F5] dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary dark:text-white font-bold tracking-widest"
                    />
                    {isLoadingCep && <div className="mt-2 text-center"><Loader2 className="w-4 h-4 text-primary animate-spin inline mr-2" /> <span className="text-[10px] font-bold text-gray-400">Consultando...</span></div>}
                    {address && (
                      <div className="mt-4 bg-[#E7FF86]/10 p-3 rounded-xl border border-[#E7FF86]/20">
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-200">{address.logradouro}, {address.bairro}</div>
                        <div className="flex justify-between items-center mt-2 border-t border-primary/5 pt-2">
                          <span className="text-[10px] font-bold text-gray-400">FRETE:</span>
                          <span className="text-sm font-black text-primary">{finalShippingValue === 0 ? 'GRÁTIS' : `R$ ${formatPrice(finalShippingValue || 0)}`}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm h-fit border border-transparent dark:border-gray-800 sticky top-24">
                <h3 className="font-black text-gray-800 dark:text-white text-lg mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 uppercase tracking-[0.2em]">Resumo</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Subtotal:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-200">R$ {formatPrice(totalOriginalValue)}</span>
                  </div>
                  {(totalItemsDiscount + couponDiscountValue) > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-500">
                      <span className="font-bold uppercase text-[10px] tracking-widest">Total de Descontos:</span>
                      <span className="font-bold">- R$ {formatPrice(totalItemsDiscount + couponDiscountValue)}</span>
                    </div>
                  )}
                  {baseShippingValue !== null && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Frete (Calculado):</span>
                        <span className="font-bold text-gray-700 dark:text-gray-200">R$ {formatPrice(baseShippingValue)}</span>
                      </div>
                      {shippingDiscountValue > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-500 animate-in fade-in slide-in-from-right-2">
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            <span className="font-bold uppercase text-[10px] tracking-widest">Desconto de Frete:</span>
                          </div>
                          <span className="font-bold">- R$ {formatPrice(shippingDiscountValue)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between items-center text-sm border-t dark:border-gray-800 pt-4">
                    <span className="font-black text-gray-800 dark:text-white text-xl">TOTAL</span>
                    <div className="text-right">
                      <div className="text-primary font-black text-2xl">R$ {formatPrice(intermediateTotal)}</div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Até 12x no cartão</div>
                    </div>
                  </div>
                </div>
                <button onClick={handleCheckout} className="w-full bg-[#F6AA1C] hover:bg-[#E09916] text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-sm transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98]">
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CHECKOUT / PAGAMENTO */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setIsCheckoutModalOpen(false)} />

          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            {checkoutStep === 'selection' ? (
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-[#1F1F1F] dark:text-white uppercase tracking-tight">Forma de Pagamento</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Pedido #DT-{Date.now().toString().slice(-6)}</p>
                  </div>
                  <button onClick={() => setIsCheckoutModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-6 h-6 text-gray-300" /></button>
                </div>

                {/* Opções de Pagamento */}
                <div className="space-y-4 mb-8">
                  <button onClick={() => setPaymentMethod('pix')} className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${paymentMethod === 'pix' ? 'border-[#00CF82] bg-gray' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'pix' ? 'bg-[#00CF82] text-white shadow-lg shadow-green-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                        <QrCode className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-[#1F1F1F] dark:text-white uppercase text-sm tracking-widest">PIX</div>
                        <div className="text-[10px] font-bold text-[#00CF82] uppercase tracking-wide">Aprovação imediata • 5% de bônus</div>
                      </div>
                    </div>
                    {paymentMethod === 'pix' && <div className="bg-[#00CF82] text-white rounded-full p-1"><Check className="w-4 h-4" /></div>}
                  </button>

                  <button onClick={() => setPaymentMethod('card')} className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${paymentMethod === 'card' ? 'border-[#C92071] bg-gray' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'card' ? 'bg-[#C92071] text-white shadow-lg shadow-pink-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-[#1F1F1F] dark:text-white uppercase text-sm tracking-widest">Cartão de Crédito</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Em até 12x sem juros</div>
                      </div>
                    </div>
                    {paymentMethod === 'card' && <div className="bg-[#C92071] text-white rounded-full p-1"><Check className="w-4 h-4" /></div>}
                  </button>

                  <button onClick={() => setPaymentMethod('boleto')} className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${paymentMethod === 'boleto' ? 'border-[#1F1F1F] bg-gray' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'boleto' ? 'bg-[#1F1F1F] text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                        <FileText className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-[#1F1F1F] dark:text-white uppercase text-sm tracking-widest">Boleto Bancário</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Vencimento em 3 dias úteis</div>
                      </div>
                    </div>
                    {paymentMethod === 'boleto' && <div className="bg-[#1F1F1F] text-white rounded-full p-1"><Check className="w-4 h-4" /></div>}
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mb-6 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Parcelamento</label>
                    <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-[#C92071]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                        <option key={num} value={num}>{num}x de R$ {formatPrice(totalFinalCheckout / num)} {num === 1 ? '(À vista)' : 'sem juros'}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Resumo Estilizado conforme a imagem */}
                <div className="bg-[#F9F8FE] dark:bg-gray-800/50 p-8 rounded-[32px] mb-8 space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-black text-[#8F9BB3] uppercase tracking-widest">
                    <span>Subtotal Produtos</span>
                    <span>R$ {formatPrice(totalOriginalValue)}</span>
                  </div>
                  {(totalItemsDiscount + couponDiscountValue) > 0 && (
                    <div className="flex justify-between items-center text-[11px] font-black text-[#00CF82] uppercase tracking-widest">
                      <span>Descontos Aplicados</span>
                      <span>- R$ {formatPrice(totalItemsDiscount + couponDiscountValue)}</span>
                    </div>
                  )}
                  {baseShippingValue !== null && (
                    <div className="flex justify-between items-center text-[11px] font-black text-[#8F9BB3] uppercase tracking-widest">
                      <span>Frete</span>
                      <span>R$ {formatPrice(baseShippingValue)}</span>
                    </div>
                  )}
                  {shippingDiscountValue > 0 && (
                    <div className="flex justify-between items-center text-[11px] font-black text-[#00CF82] uppercase tracking-widest">
                      <span>Desconto de Frete</span>
                      <span>- R$ {formatPrice(shippingDiscountValue)}</span>
                    </div>
                  )}
                  {paymentMethod === 'pix' && (
                    <div className="flex justify-between items-center text-[11px] font-black text-[#00CF82] uppercase tracking-widest animate-in slide-in-from-right-2">
                      <span>Desconto Pix (5%)</span>
                      <span>- R$ {formatPrice(pixDiscountAmount)}</span>
                    </div>
                  )}

                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-2 mb-1 opacity-60">
                      <Lock className="w-4 h-4 text-[#00CF82]" />
                      <span className="text-[10px] font-black text-[#8F9BB3] uppercase tracking-widest">Checkout Seguro</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-[#8F9BB3] uppercase block tracking-widest mb-1">Total a Pagar</span>
                      <span className="text-3xl font-black text-[#C92071]">R$ {formatPrice(totalFinalCheckout)}</span>
                    </div>
                  </div>
                </div>

                <button onClick={confirmPurchase} disabled={!paymentMethod || isProcessing} className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${paymentMethod && !isProcessing ? 'bg-[#C92071] text-white shadow-2xl shadow-pink-500/30 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />Processando...</>) : (<>Confirmar Pagamento<ChevronRight className="w-5 h-5" /></>)}
                </button>
              </div>
            ) : (
              <div className="p-16 text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-[#00CF82] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30"><Check className="w-12 h-12" /></div>
                <h2 className="text-3xl font-black text-[#1F1F1F] dark:text-white uppercase tracking-tighter mb-4">Pedido Realizado!</h2>
                <p className="text-gray-500 font-medium mb-10">O número do seu pedido é <span className="text-[#C92071] font-bold">#DT-884291</span>. <br /> Enviamos um e-mail de confirmação com os detalhes.</p>
                <div className="space-y-4">
                  <Link to="/meus-pedidos" onClick={() => setIsCheckoutModalOpen(false)} className="w-full bg-[#C92071] text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl">Acompanhar Pedido</Link>
                  <button onClick={() => setIsCheckoutModalOpen(false)} className="w-full text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors">Fechar e Sair</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
