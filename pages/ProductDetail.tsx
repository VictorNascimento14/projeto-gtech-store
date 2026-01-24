
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, X, AlertCircle, ArrowRight } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../src/components/ProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById, products } = useProducts();
  const { addItem } = useCart();

  const product = getProductById(Number(id));
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('Padrão');
  const [showToast, setShowToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Mapeamento de tamanhos por categoria para exibição
  const getSizesByProductCategory = (category: string) => {
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

  const currentSizeSet = useMemo(() => {
    if (!product) return [];
    return getSizesByProductCategory(product.category);
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center bg-[#F9F8FE] dark:bg-gray-950 min-h-screen">
        <h2 className="text-2xl font-bold">Produto não encontrado</h2>
        <Link to="/produtos" className="text-primary hover:underline mt-4 inline-block">Voltar para a loja</Link>
      </div>
    );
  }

  const gallery = [product.image, ...(product.images || [])];
  const uniqueGallery = Array.from(new Set(gallery));

  const isSizeAvailable = (size: string) => {
    if (!product.availableSizes) return true;
    return product.availableSizes.includes(size);
  };

  const handleSizeClick = (size: string) => {
    if (!isSizeAvailable(size)) {
      setShowToast({ message: 'Tamanho sem estoque no momento.', type: 'error' });
      return;
    }
    setSelectedSize(size);
  };

  const handleBuy = () => {
    if (!selectedSize) {
      setShowToast({ message: 'Por favor, selecione um tamanho disponível.', type: 'error' });
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      color: selectedColor,
      size: selectedSize,
      quantity: 1
    });
    setShowToast({ message: 'Produto adicionado!', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-[#F9F8FE] dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 py-8 lg:px-12 relative">
        {/* Toast Animado */}
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'}`}>
          <div className={`bg-white dark:bg-gray-800 border-l-4 shadow-2xl rounded-xl py-4 px-6 flex items-center gap-4 min-w-[320px] ${showToast?.type === 'error' ? 'border-red-500' : 'border-primary'}`}>
            <div className={`p-2 rounded-full ${showToast?.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
              {showToast?.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            </div>
            <div className="flex-grow">
              <p className="font-bold text-gray-800 dark:text-white text-sm">{showToast?.message}</p>
            </div>
            <button onClick={() => setShowToast(null)} className="text-gray-300 hover:text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/produtos" className="hover:text-primary transition-colors">Produtos</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-200 font-medium">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          <div className="lg:w-7/12 space-y-4">
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl aspect-[4/3] flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm z-10">
              {product.discount && (
                <span className="absolute top-6 left-6 bg-accent-yellow text-gray-800 text-[10px] font-black px-4 py-1.5 rounded-full z-10 shadow-lg">
                  {product.discount}
                </span>
              )}
              <img
                alt={product.name}
                className="object-contain w-3/4 mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-500 ease-out"
                src={uniqueGallery[activeImageIndex]}
              />
            </div>

            <div className="grid grid-cols-5 gap-4">
              {uniqueGallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`aspect-square bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center p-2 border-2 transition-all ${activeImageIndex === i ? 'border-primary ring-4 ring-primary/10' : 'border-gray-50 dark:border-gray-700 hover:border-primary/50 opacity-60 hover:opacity-100'}`}
                >
                  <img alt={`Thumbnail ${i}`} className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal" src={img} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-5/12 space-y-8 z-10">
            <div>
              <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-2 leading-tight tracking-tight">{product.name}</h1>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">{product.category}</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">(PRODUTO EM ALTA)</span>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex flex-col">
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through font-medium">R$ {product.originalPrice},00</span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-400 font-bold mb-1">R$</span>
                  <span className="text-6xl font-black text-gray-800 dark:text-white tracking-tighter leading-none">{product.price}</span>
                  <span className="text-xl font-bold text-gray-800 dark:text-white">,00</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-bold text-gray-400 mb-4 text-[10px] uppercase tracking-[0.2em]">Descrição</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium">
                {product.description || "Este item premium foi selecionado pela Digital Store pela sua qualidade excepcional e design vanguardista."}
              </p>
            </div>

            {currentSizeSet.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-400 mb-4 text-[10px] uppercase tracking-[0.2em]">Tamanho</h3>
                <div className="flex flex-wrap gap-3">
                  {currentSizeSet.map(size => {
                    const available = isSizeAvailable(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeClick(size)}
                        className={`relative min-w-[56px] h-14 px-4 rounded-2xl border-2 flex items-center justify-center text-sm transition-all font-black overflow-hidden
                          ${!available ? 'opacity-30 border-gray-100 cursor-not-allowed bg-gray-50 grayscale' :
                            selectedSize === size ? 'bg-primary text-white border-primary shadow-xl shadow-primary/30 scale-110 z-10' :
                              'border-gray-100 dark:border-gray-800 dark:text-gray-400 hover:border-primary/30 hover:text-primary bg-white dark:bg-gray-900'}
                        `}
                      >
                        {size}
                        {!available && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-px bg-gray-400 -rotate-45 absolute opacity-40"></div>
                            <div className="w-full h-px bg-gray-400 rotate-45 absolute opacity-40"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-6">
              <button
                onClick={handleBuy}
                disabled={!selectedSize}
                className={`w-full font-black py-6 rounded-3xl uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-4
                  ${selectedSize ? 'bg-primary hover:bg-primary-hover text-white shadow-2xl shadow-primary/30 active:scale-[0.96]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
              >
                {selectedSize ? 'Comprar Agora' : 'Selecione um tamanho'}
              </button>
            </div>
          </div>
        </div>

        {/* Seção de Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-16 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Produtos Relacionados</h3>
                <p className="text-gray-400 text-sm font-medium">Itens da categoria {product.category} que você também pode gostar.</p>
              </div>
              <Link
                to={`/produtos?categoria=${product.category}`}
                className="text-primary font-bold text-sm hover:translate-x-1 transition-transform flex items-center gap-2 group"
              >
                Ver tudo nesta categoria
                <ArrowRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                <div key={p.id} className="hover:-translate-y-2 transition-transform duration-300">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
