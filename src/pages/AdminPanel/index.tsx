
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  Plus,
  Trash2,
  Package,
  DollarSign,
  ArrowUpRight,
  X,
  Image as ImageIcon,
  CheckCircle,
  Truck,
  PlusCircle,
  LayoutDashboard,
  Box,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Target,
  Tag,
  Percent,
  Gift,
  Edit
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { CATEGORIES } from '../constants';
import { Product, Coupon, HeroSlide, Customer, Order } from '../types';

const AdminPanel: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const { products, coupons, heroSlides, customers, orders, addProduct, updateProduct, deleteProduct, addCoupon, deleteCoupon, addHeroSlide, updateHeroSlide, deleteHeroSlide, updateOrderStatus } = useProducts();
  const navigate = useNavigate();

  // Navegação Interna
  const [activeTab, setActiveTab] = useState<'inventory' | 'dashboard' | 'hero' | 'customers' | 'orders'>('inventory');

  // Estados Modais e Toasts
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isHeroSlideModalOpen, setIsHeroSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingStockProductId, setEditingStockProductId] = useState<number | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Estados Formulário Produto
  const [extraImageUrl, setExtraImageUrl] = useState('');
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: CATEGORIES[0].name,
    price: 0,
    originalPrice: '',
    image: '',
    images: [] as string[],
    description: '',
    discount: '',
    stock: 0
  });

  // Mapeamento de tamanhos por categoria
  const getSizesForCategory = (category: string) => {
    switch (category) {
      case 'Tênis':
        return ['37', '38', '39', '40', '41', '42', '43'];
      case 'Camisetas':
      case 'Calças':
      case 'Blusas':
        return ['P', 'M', 'G', 'GG', 'XG'];
      case 'Headphones':
      case 'Bonés':
        return ['Único'];
      default:
        return ['P', 'M', 'G', 'GG'];
    }
  };

  const currentSizeOptions = useMemo(() => getSizesForCategory(newProduct.category), [newProduct.category]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Sincroniza tamanhos selecionados quando a categoria muda
  useEffect(() => {
    setSelectedSizes(currentSizeOptions);
  }, [currentSizeOptions]);

  // Estados Formulário Cupom
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: '',
    type: 'product' as 'product' | 'shipping',
    isFreeShipping: false,
    stackable: true
  });

  // Estados Formulário Hero Slide
  const [newHeroSlide, setNewHeroSlide] = useState<Omit<HeroSlide, 'id'>>({
    tag: '',
    title: '',
    description: '',
    buttonText: 'Ver Ofertas',
    buttonLink: '/produtos',
    image: '',
    bgColor: 'bg-[#F5F5F5]',
    bgDark: 'dark:bg-gray-900/50'
  });

  // Proteção de Rota
  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isLoggedIn, user, navigate]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Cálculo automático de preço
  useEffect(() => {
    const original = Number(newProduct.originalPrice);
    const pct = Number(discountPercent);

    if (original > 0) {
      if (pct > 0 && pct <= 100) {
        const calculatedPrice = Math.round(original * (1 - pct / 100));
        setNewProduct(prev => ({
          ...prev,
          price: calculatedPrice,
          discount: `${pct}% OFF`
        }));
      } else {
        setNewProduct(prev => ({
          ...prev,
          price: original,
          discount: ''
        }));
      }
    }
  }, [newProduct.originalPrice, discountPercent]);

  // Lógica de Dashboard (Métricas Reais)
  const dashboardMetrics = useMemo(() => {
    // Filtrar pedidos válidos (não cancelados)
    const validOrders = orders.filter(o => o.status !== 'cancelled');

    // Faturamento Total
    const revenue = validOrders.reduce((acc, order) => acc + order.total, 0);

    // Total de Pedidos
    const totalOrders = validOrders.length;

    // Ticket Médio
    const avgTicket = totalOrders > 0 ? revenue / totalOrders : 0;

    // Contagem de categorias
    const categoryCount = CATEGORIES.map(cat => ({
      name: cat.name,
      count: products.filter(p => p.category === cat.name).length
    }));

    // Calcular vendas por produto
    const productSales = new Map<number, number>();

    validOrders.forEach(order => {
      order.items.forEach(item => {
        const current = productSales.get(item.productId) || 0;
        productSales.set(item.productId, current + item.quantity);
      });
    });

    // Top Sellers (Mais vendidos)
    const topSellers = products
      .map(p => ({ ...p, sales: productSales.get(p.id) || 0 }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);

    // Low Sellers (Menos vendidos - mas que já tiveram pelo menos alguma venda ou 0)
    // Mostramos os que têm menos vendas (limitado aos com 0 ou poucas vendas)
    const lowSellers = products
      .map(p => ({ ...p, sales: productSales.get(p.id) || 0 }))
      .sort((a, b) => a.sales - b.sales)
      .slice(0, 3);

    return {
      revenue,
      totalOrders,
      avgTicket,
      conversionRate: 3.2, // Mantido como estático por enquanto (necessitaria de analytics de visitas)
      categoryCount,
      topSellers,
      lowSellers
    };
  }, [products, orders]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const addExtraImage = () => {
    if (extraImageUrl.trim()) {
      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images, extraImageUrl.trim()]
      }));
      setExtraImageUrl('');
    }
  };

  const removeExtraImage = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        originalPrice: Number(newProduct.originalPrice),
        image: newProduct.image || 'https://via.placeholder.com/400x400?text=Sem+Imagem',
        images: newProduct.images,
        discount: newProduct.discount,
        description: newProduct.description,
        availableSizes: selectedSizes,
        stock: newProduct.stock
      };

      if (editingProduct) {
        await updateProduct({ ...productData, id: editingProduct.id });
        setToast({ message: 'Produto atualizado com sucesso!', type: 'success' });
      } else {
        await addProduct(productData as any);
        setToast({ message: 'Produto cadastrado com sucesso!', type: 'success' });
      }

      setIsProductModalOpen(false);
      resetProductForm();
    } catch (error) {
      console.error(error);
      setToast({ message: 'Erro ao salvar produto', type: 'error' });
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const couponToAdd: Coupon = {
        id: Date.now(),
        code: newCoupon.code.toUpperCase().trim(),
        discountPercent: newCoupon.isFreeShipping ? 100 : (Number(newCoupon.discountPercent) || 0),
        type: newCoupon.type,
        isFreeShipping: newCoupon.type === 'shipping' ? newCoupon.isFreeShipping : false,
        stackable: newCoupon.stackable
      };
      await addCoupon(couponToAdd);
      setToast({ message: 'Cupom criado com sucesso!', type: 'success' });
      setIsCouponModalOpen(false);
      setNewCoupon({ code: '', discountPercent: '', type: 'product', isFreeShipping: false, stackable: true });
    } catch (error) {
      setToast({ message: 'Erro ao criar cupom', type: 'error' });
    }
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      category: CATEGORIES[0].name,
      price: 0,
      originalPrice: '',
      image: '',
      images: [],
      description: '',
      discount: '',
      stock: 0
    });
    setDiscountPercent('');
    setExtraImageUrl('');
    setSelectedSizes(getSizesForCategory(CATEGORIES[0].name));
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice.toString(),
      image: product.image,
      images: product.images || [],
      description: product.description || '',
      discount: product.discount || '',
      stock: product.stock || 0
    });

    // Extrair porcentagem do desconto se houver
    if (product.discount && product.discount.includes('%')) {
      setDiscountPercent(product.discount.replace('% OFF', ''));
    } else {
      setDiscountPercent('');
    }

    setSelectedSizes(product.availableSizes || getSizesForCategory(product.category));
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Excluir produto definitivamente?')) {
      try {
        await deleteProduct(id);
        setToast({ message: 'Produto removido do estoque.', type: 'success' });
      } catch (error) {
        setToast({ message: 'Erro ao remover produto', type: 'error' });
      }
    }
  };

  const handleEditStock = (product: Product) => {
    setEditingStockProductId(product.id);
    setEditingStockValue(product.stock || 0);
  };

  const handleSaveStock = async (product: Product) => {
    try {
      const updatedProduct = { ...product, stock: editingStockValue };
      await updateProduct(updatedProduct);
      setEditingStockProductId(null);
      setToast({ message: 'Estoque atualizado com sucesso!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Erro ao atualizar estoque', type: 'error' });
    }
  };

  const handleCancelEditStock = () => {
    setEditingStockProductId(null);
    setEditingStockValue(0);
  };

  const handleDeleteCoupon = async (id: number) => {
    if (window.confirm('Remover este cupom de desconto?')) {
      try {
        await deleteCoupon(id);
        setToast({ message: 'Cupom removido com sucesso.', type: 'success' });
      } catch (error) {
        setToast({ message: 'Erro ao remover cupom', type: 'error' });
      }
    }
  };

  const handleAddHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slideToAdd: HeroSlide = {
        id: Date.now(),
        ...newHeroSlide
      };

      if (editingSlide) {
        await updateHeroSlide({ ...slideToAdd, id: editingSlide.id });
        setToast({ message: 'Slide atualizado com sucesso!', type: 'success' });
      } else {
        await addHeroSlide(slideToAdd);
        setToast({ message: 'Slide adicionado ao carrossel!', type: 'success' });
      }

      setIsHeroSlideModalOpen(false);
      resetHeroSlideForm();
    } catch (error) {
      setToast({ message: 'Erro ao gerenciar slide', type: 'error' });
    }
  };

  const resetHeroSlideForm = () => {
    setNewHeroSlide({
      tag: '',
      title: '',
      description: '',
      buttonText: 'Ver Ofertas',
      buttonLink: '/produtos',
      image: '',
      bgColor: 'bg-[#F5F5F5]',
      bgDark: 'dark:bg-gray-900/50'
    });
    setEditingSlide(null);
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setNewHeroSlide({
      tag: slide.tag,
      title: slide.title,
      description: slide.description,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      image: slide.image,
      bgColor: slide.bgColor,
      bgDark: slide.bgDark
    });
    setIsHeroSlideModalOpen(true);
  };

  const handleDeleteSlide = async (id: number) => {
    if (window.confirm('Remover este slide do carrossel?')) {
      try {
        await deleteHeroSlide(id);
        setToast({ message: 'Slide removido com sucesso.', type: 'success' });
      } catch (error) {
        setToast({ message: 'Erro ao remover slide', type: 'error' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8FE] dark:bg-gray-950 p-6 lg:p-12 transition-colors relative">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl py-3 px-6 flex items-center gap-3 border border-gray-100 dark:border-gray-700">
            <div className="bg-green-500/10 p-1.5 rounded-full text-green-500">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto">
        {/* Header de Gerenciamento */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Admin Panel</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Gestão centralizada de performance e inventário.</p>
          </div>

          <div className="flex items-center bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-sm border dark:border-gray-800">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'inventory' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
              <Box className="w-4 h-4" />
              Inventário
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('hero')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'hero' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
              <ImageIcon className="w-4 h-4" />
              Hero
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'customers' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
              <Users className="w-4 h-4" />
              Clientes
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              Pedidos
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setNewCoupon({ code: '', discountPercent: '', type: 'product', isFreeShipping: false, stackable: true });
                setIsCouponModalOpen(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Novo Cupom
            </button>
            <button
              onClick={() => { resetProductForm(); setIsProductModalOpen(true); }}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Novo Produto
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          /* VIEW DASHBOARD */
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
                <p className="text-2xl font-black text-gray-800 dark:text-white">R$ {dashboardMetrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-500/10 text-blue-500 p-3 rounded-2xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="text-blue-500 text-[10px] font-black bg-blue-500/5 px-2 py-1 rounded-full">LIVE</span>
                </div>
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total de Pedidos</h3>
                <p className="text-2xl font-black text-gray-800 dark:text-white">{dashboardMetrics.totalOrders}</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-purple-500/10 text-purple-500 p-3 rounded-2xl">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Ticket Médio</h3>
                <p className="text-2xl font-black text-gray-800 dark:text-white">R$ {dashboardMetrics.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Taxa de Conversão</h3>
                <p className="text-2xl font-black text-gray-800 dark:text-white">{dashboardMetrics.conversionRate}%</p>
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
                  {dashboardMetrics.topSellers.map((product, i) => (
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
                  {dashboardMetrics.categoryCount.map(cat => {
                    const percentage = (cat.count / products.length) * 100;
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
                  {dashboardMetrics.lowSellers.map((product) => (
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
                  <p className="text-white/80 font-medium mb-6">Existem {products.filter(p => !p.availableSizes || p.availableSizes.length < 3).length} produtos com grade incompleta (menos de 3 numerações). Recomendamos reposição.</p>
                </div>
                <button className="bg-white text-primary font-black py-4 px-8 rounded-2xl uppercase tracking-widest text-xs self-start hover:scale-105 transition-all active:scale-95 shadow-xl z-10 flex items-center gap-2">
                  Gerar Relatório de Compra
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        ) : activeTab === 'hero' ? (
          /* VIEW HERO SLIDES */
          <div className="animate-in fade-in duration-500 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden">
              <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Slides do Carrossel Hero</h2>
                  <p className="text-xs text-gray-500 mt-1">Gerencie os slides que aparecem no carrossel principal da Home</p>
                </div>
                <button
                  onClick={() => { resetHeroSlideForm(); setIsHeroSlideModalOpen(true); }}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Novo Slide
                </button>
              </div>
              <div className="p-4 space-y-4">
                {heroSlides.map((slide, index) => (
                  <div key={slide.id} className="flex items-center gap-6 p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-all group">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-2xl font-black text-gray-200 dark:text-gray-700 w-8">{index + 1}</span>
                      <div className="w-24 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                        <img src={slide.image} className="w-full h-full object-cover" alt={slide.title} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 dark:text-white text-sm">{slide.title}</div>
                        <div className="text-xs text-gray-400 font-medium mt-1">{slide.tag}</div>
                        <div className="text-xs text-primary font-medium mt-1">{slide.buttonText}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditSlide(slide)}
                        className="p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 rounded-lg transition-all"
                        title="Editar Slide"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 rounded-lg transition-all"
                        title="Excluir Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {heroSlides.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">Nenhum slide cadastrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'customers' ? (
          /* VIEW CLIENTES */
          <div className="animate-in fade-in duration-500">
            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden">
              <div className="p-8 border-b border-gray-50 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Clientes Cadastrados</h2>
                    <p className="text-xs text-gray-500 mt-1">{customers.length} clientes registrados na plataforma</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Cliente</th>
                      <th className="px-8 py-4">Contato</th>
                      <th className="px-8 py-4">Data Cadastro</th>
                      <th className="px-8 py-4">Total Gasto</th>
                      <th className="px-8 py-4">Pedidos</th>
                      <th className="px-8 py-4">Último Pedido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-8 py-6">
                          <div>
                            <div className="font-bold text-gray-800 dark:text-white">{customer.name}</div>
                            {customer.cpf && (
                              <div className="text-xs text-gray-400 font-medium mt-1">CPF: {customer.cpf}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm">
                            <div className="text-gray-600 dark:text-gray-300 font-medium">{customer.email}</div>
                            {customer.phone && (
                              <div className="text-xs text-gray-400 mt-1">{customer.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            {new Date(customer.registeredAt).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-black text-green-600">
                            R$ {customer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-800 dark:text-white">{customer.totalOrders}</span>
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs text-gray-500 font-medium">
                            {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('pt-BR') : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {customers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">Nenhum cliente cadastrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          /* VIEW PEDIDOS */
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
                      <span className="text-xs font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length} Pendente</span>
                    </div>
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <span className="text-xs font-bold text-blue-600">{orders.filter(o => o.status === 'processing').length} Processando</span>
                    </div>
                    <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <span className="text-xs font-bold text-purple-600">{orders.filter(o => o.status === 'shipped').length} Enviado</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {orders.map((order) => {
                  const statusConfig = {
                    pending: { label: 'Pendente', color: 'yellow', icon: AlertTriangle },
                    processing: { label: 'Processando', color: 'blue', icon: Package },
                    shipped: { label: 'Enviado', color: 'purple', icon: Truck },
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

                      <div className="border-t dark:border-gray-800 pt-4 mt-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-400 font-bold uppercase tracking-wider">Pagamento:</span>
                            <div className="text-gray-600 dark:text-gray-300 font-medium mt-1">{order.paymentMethod}</div>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold uppercase tracking-wider">Endereço:</span>
                            <div className="text-gray-600 dark:text-gray-300 font-medium mt-1">{order.shippingAddress}</div>
                          </div>
                        </div>
                      </div>

                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          Processar Pedido
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          Marcar como Enviado
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          Marcar como Entregue
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 rounded-lg text-xs font-bold transition-all"
                        >
                          Cancelar
                        </button>
                      )}
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
          </div >
        ) : (
          /* VIEW INVENTÁRIO (ANTIGA) */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden">
              <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Estoque Ativo</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Produto</th>
                      <th className="px-8 py-4">Categoria</th>
                      <th className="px-8 py-4">Preço Final</th>
                      <th className="px-8 py-4">Estoque</th>
                      <th className="px-8 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-hidden shrink-0">
                              <img src={product.image} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" alt={product.name} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700 dark:text-gray-200 text-sm truncate max-w-[150px] group-hover:text-primary transition-colors">{product.name}</span>
                              <div className="flex gap-1 mt-1">
                                {product.availableSizes?.map(s => (
                                  <span key={s} className="text-[8px] bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-400 font-bold">{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{product.category}</td>
                        <td className="px-8 py-6 font-black text-gray-800 dark:text-white text-sm">
                          R$ {product.price},00
                          {product.discount && (
                            <span className="ml-2 text-[8px] bg-accent-yellow text-gray-800 px-1.5 py-0.5 rounded-full font-black">{product.discount}</span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          {editingStockProductId === product.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={editingStockValue}
                                onChange={(e) => setEditingStockValue(Number(e.target.value))}
                                className="w-20 bg-gray-50 dark:bg-gray-800 border-2 border-primary rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveStock(product)}
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                                title="Salvar"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEditStock}
                                className="p-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-all"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-black ${(product.stock || 0) === 0 ? 'text-red-500' :
                                (product.stock || 0) < 10 ? 'text-orange-500' :
                                  'text-green-500'
                                }`}>
                                {product.stock || 0}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">un</span>
                              {(product.stock || 0) === 0 && (
                                <span className="ml-2 text-[8px] bg-red-50 dark:bg-red-900/20 text-red-600 px-2 py-0.5 rounded-full font-black">SEM ESTOQUE</span>
                              )}
                              {(product.stock || 0) > 0 && (product.stock || 0) < 10 && (
                                <span className="ml-2 text-[8px] bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-2 py-0.5 rounded-full font-black">BAIXO</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {editingStockProductId !== product.id && (
                              <button
                                onClick={() => handleEditStock(product)}
                                title="Editar Estoque"
                                className="p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 rounded-xl transition-all"
                              >
                                <Package className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              title="Excluir Produto"
                              className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              title="Editar Produto Completo"
                              className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-orange-500 hover:text-white text-orange-500 rounded-xl transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-transparent dark:border-gray-800 overflow-hidden h-fit">
              <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Cupons Ativos</h2>
              </div>
              <div className="p-4 space-y-2">
                {coupons.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Sem cupons ativos</p>
                  </div>
                )}
                {coupons.map(coupon => (
                  <div key={coupon.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl transition-colors ${coupon.type === 'shipping' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'}`}>
                        {coupon.type === 'shipping' ? <Truck className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-black text-gray-800 dark:text-white text-xs tracking-widest flex items-center gap-2">
                          {coupon.code}
                          {coupon.type === 'shipping' && <span className="text-[8px] bg-blue-100 dark:bg-blue-900 text-blue-600 px-1.5 py-0.5 rounded-full uppercase">FRETE</span>}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {coupon.isFreeShipping ? 'FRETE GRÁTIS' : `${coupon.discountPercent}% OFF`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div >

      {/* MODAL PRODUTO */}
      {
        isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center p-10 border-b dark:border-gray-800">
                <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                  {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Item'}
                </h2>
                <button onClick={() => setIsProductModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <form onSubmit={handleAddProduct} className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Nome Comercial</label>
                      <input required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold" placeholder="Ex: Tênis Nike Air Max" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Categoria</label>
                        <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold">
                          {CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Preço de Tabela (R$)</label>
                        <input required type="number" value={newProduct.originalPrice} onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Desconto Direto (%)</label>
                        <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold" />
                      </div>
                      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex flex-col justify-center">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Preço Sugerido</span>
                        <span className="text-xl font-black dark:text-white">R$ {newProduct.price.toLocaleString()},00</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Quantidade em Estoque</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={newProduct.stock}
                        onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold"
                        placeholder="Ex: 50"
                      />
                      <p className="text-xs text-gray-400 mt-2">Unidades disponíveis para venda</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Grade em Estoque ({newProduct.category})</label>
                      <div className="flex flex-wrap gap-3">
                        {currentSizeOptions.map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`min-w-[48px] h-12 px-3 rounded-xl border-2 text-xs font-black transition-all ${selectedSizes.includes(size) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-gray-100 dark:border-gray-800 text-gray-400 dark:bg-gray-800'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Capa Principal (URL)</label>
                      <input required value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white" placeholder="https://..." />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Galeria Adicional (URL)</label>
                      <div className="flex gap-3">
                        <input
                          value={extraImageUrl}
                          onChange={e => setExtraImageUrl(e.target.value)}
                          className="flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                          placeholder="Link da imagem..."
                        />
                        <button
                          type="button"
                          onClick={addExtraImage}
                          className="bg-gray-800 dark:bg-gray-700 text-white p-4 rounded-2xl hover:bg-gray-950 transition-all shadow-xl"
                        >
                          <PlusCircle className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    {newProduct.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {newProduct.images.map((img, i) => (
                          <div key={i} className="relative aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden group border dark:border-gray-700">
                            <img src={img} className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal" />
                            <button
                              type="button"
                              onClick={() => removeExtraImage(i)}
                              className="absolute inset-0 bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[200px]">
                      <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Preview em Tempo Real</div>
                      {newProduct.image ? <img src={newProduct.image} className="max-w-full max-h-40 object-contain mix-blend-multiply dark:mix-blend-normal" /> : <ImageIcon className="w-16 h-16 text-gray-200" />}
                    </div>
                  </div>
                </div>

                <div className="mt-16 flex gap-6">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-grow py-5 font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-[3] bg-primary text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {editingProduct ? 'Salvar Alterações' : 'Ativar Produto na Loja'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* MODAL CUPOM */}
      {
        isCouponModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCouponModalOpen(false)} />
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Gerar Promoção</h2>
                <button onClick={() => setIsCouponModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <form onSubmit={handleAddCoupon} className="p-10 space-y-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Tipo do Cupom</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewCoupon({ ...newCoupon, type: 'product', isFreeShipping: false })}
                      className={`flex flex-col items-center gap-2 p-5 rounded-[24px] border-2 transition-all ${newCoupon.type === 'product' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
                    >
                      <Target className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase">Carrinho</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCoupon({ ...newCoupon, type: 'shipping' })}
                      className={`flex flex-col items-center gap-2 p-5 rounded-[24px] border-2 transition-all ${newCoupon.type === 'shipping' ? 'border-blue-500 bg-blue-500/5 text-blue-500' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
                    >
                      <Truck className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase">Entrega</span>
                    </button>
                  </div>
                </div>

                {newCoupon.type === 'shipping' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Modo de Entrega</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewCoupon({ ...newCoupon, isFreeShipping: false })}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all text-[10px] font-black uppercase ${!newCoupon.isFreeShipping ? 'border-blue-500 bg-blue-500/10 text-blue-600' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                        Desconto %
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCoupon({ ...newCoupon, isFreeShipping: true, discountPercent: '100' })}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all text-[10px] font-black uppercase ${newCoupon.isFreeShipping ? 'border-green-500 bg-green-500/10 text-green-600' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Frete Grátis
                      </button>
                    </div>
                  </div>
                )}

                <div className="animate-in fade-in duration-300">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Código Alfa</label>
                  <input required value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="EX: SUMMER2025" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 font-black tracking-widest dark:text-white focus:ring-2 focus:ring-primary" />
                </div>

                {!newCoupon.isFreeShipping && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Porcentagem de Redução</label>
                    <div className="relative">
                      <input required type="number" min="1" max="100" value={newCoupon.discountPercent} onChange={e => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 dark:text-white font-black focus:ring-2 focus:ring-primary" placeholder="Ex: 15" />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-400">%</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-6">
                  <button type="button" onClick={() => setIsCouponModalOpen(false)} className="flex-grow py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">Voltar</button>
                  <button type="submit" className={`flex-[2] text-white py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 ${newCoupon.type === 'shipping' ? (newCoupon.isFreeShipping ? 'bg-green-500 shadow-green-500/30' : 'bg-blue-500 shadow-blue-500/30') : 'bg-orange-500 shadow-orange-500/30'}`}>
                    {newCoupon.isFreeShipping ? 'Publicar Frete Grátis' : 'Publicar Cupom'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* MODAL HERO SLIDE */}
      {
        isHeroSlideModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setIsHeroSlideModalOpen(false); resetHeroSlideForm(); }} />
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                  {editingSlide ? 'Editar Slide' : 'Novo Slide Hero'}
                </h2>
                <button onClick={() => { setIsHeroSlideModalOpen(false); resetHeroSlideForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleAddHeroSlide} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Tag/Etiqueta</label>
                  <input
                    required
                    value={newHeroSlide.tag}
                    onChange={e => setNewHeroSlide({ ...newHeroSlide, tag: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold"
                    placeholder="Ex: Melhores ofertas personalizadas"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Título Principal</label>
                  <input
                    required
                    value={newHeroSlide.title}
                    onChange={e => setNewHeroSlide({ ...newHeroSlide, title: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold"
                    placeholder="Ex: Queima de stoque Nike 🔥"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Descrição</label>
                  <textarea
                    required
                    value={newHeroSlide.description}
                    onChange={e => setNewHeroSlide({ ...newHeroSlide, description: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-medium resize-none"
                    rows={3}
                    placeholder="Descrição do slide"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Texto do Botão</label>
                    <input
                      required
                      value={newHeroSlide.buttonText}
                      onChange={e => setNewHeroSlide({ ...newHeroSlide, buttonText: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold"
                      placeholder="Ex: Ver Ofertas"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Link do Botão</label>
                    <input
                      required
                      value={newHeroSlide.buttonLink}
                      onChange={e => setNewHeroSlide({ ...newHeroSlide, buttonLink: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-bold"
                      placeholder="Ex: /produtos"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">URL da Imagem do Tênis</label>
                  <input
                    required
                    type="url"
                    value={newHeroSlide.image}
                    onChange={e => setNewHeroSlide({ ...newHeroSlide, image: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary dark:text-white font-medium"
                    placeholder="https://..."
                  />
                  {newHeroSlide.image && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-400 font-bold mb-2">Preview:</p>
                      <img src={newHeroSlide.image} alt="Preview" className="w-32 h-32 object-contain mx-auto" />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-6">
                  <button
                    type="button"
                    onClick={() => { setIsHeroSlideModalOpen(false); resetHeroSlideForm(); }}
                    className="flex-grow py-4 font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-primary hover:bg-primary-hover text-white py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 transition-all active:scale-95"
                  >
                    {editingSlide ? 'Atualizar Slide' : 'Adicionar Slide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default AdminPanel;
