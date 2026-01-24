
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
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import { CATEGORIES } from '../../constants';
import { Product, Coupon, HeroSlide, Customer, Order } from '../../types';
import AdminDashboard from './components/AdminDashboard';
import InventoryTab from './components/InventoryTab';
import AdminOrders from './components/AdminOrders';
import AdminCustomers from './components/AdminCustomers';
import ProductModal from './components/ProductModal';
import CouponModal from './components/CouponModal';
import HeroSlideModal from './components/HeroSlideModal';

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
          <AdminDashboard metrics={dashboardMetrics} productsCount={products.length} />
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
          <AdminCustomers customers={customers} />
        ) : activeTab === 'orders' ? (
          <AdminOrders orders={orders} updateOrderStatus={updateOrderStatus} />
        ) : (
          <InventoryTab
            products={products}
            coupons={coupons}
            editingStockProductId={editingStockProductId}
            editingStockValue={editingStockValue}
            setEditingStockValue={setEditingStockValue}
            handleSaveStock={handleSaveStock}
            handleCancelEditStock={handleCancelEditStock}
            handleEditStock={handleEditStock}
            handleDeleteProduct={handleDeleteProduct}
            handleEditProduct={handleEditProduct}
            handleDeleteCoupon={handleDeleteCoupon}
          />
        )}
      </div >

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        selectedSizes={selectedSizes}
        toggleSize={toggleSize}
        currentSizeOptions={currentSizeOptions}
        extraImageUrl={extraImageUrl}
        setExtraImageUrl={setExtraImageUrl}
        addExtraImage={addExtraImage}
        removeExtraImage={removeExtraImage}
        handleSubmit={handleAddProduct}
      />

      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        newCoupon={newCoupon}
        setNewCoupon={setNewCoupon}
        handleSubmit={handleAddCoupon}
      />

      <HeroSlideModal 
        isOpen={isHeroSlideModalOpen}
        onClose={() => { setIsHeroSlideModalOpen(false); resetHeroSlideForm(); }}
        editingSlide={editingSlide}
        newHeroSlide={newHeroSlide}
        setNewHeroSlide={setNewHeroSlide}
        handleSubmit={handleAddHeroSlide}
      />
    </div >
  );
};

export default AdminPanel;
