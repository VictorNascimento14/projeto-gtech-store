
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Sun, Moon, LogOut, Package, ChevronDown, ArrowRight, Settings, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { Product } from '../src/types';
import Logo from '../src/components/Logo';
import Footer from '../src/components/Footer';
import DarkModeToggle from '../src/components/DarkModeToggle';



const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems, items, clearCart, subtotal } = useCart();
  const [showCartModal, setShowCartModal] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { products } = useProducts();
  const { favorites } = useFavorites();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fecha o menu mobile quando a rota muda
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setShowCartModal(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length >= 2) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.category.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/produtos?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (id: number) => {
    navigate(`/produto/${id}`);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition-all duration-200 whitespace-nowrap pb-[2px] border-b-2 text-base tracking-tight inline-block ${isActive
      ? 'text-primary border-primary font-bold'
      : 'text-[#474747] dark:text-gray-400 border-transparent hover:text-primary font-normal'
    }`;

  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-950">
      <DarkModeToggle />

      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-4 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 flex-shrink-0">
            {/* Menu Hambúrguer - Mobile Only - Extrema Esquerda */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 text-primary bg-white dark:bg-gray-900 border-2 border-primary/20 hover:border-primary rounded-xl shadow-lg shadow-primary/5 transition-all active:scale-95"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Logo variant="header" className="md:mx-0 mx-auto" />

            {/* Espaçador invisível para manter o logo centralizado no mobile */}
            <div className="w-10 md:hidden" />
          </div>

          <div className="flex-grow max-w-xl w-full relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative z-50">
              <input
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                className="w-full bg-[#F5F5F5] dark:bg-gray-800 border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary placeholder-gray-400 dark:text-white transition-colors"
                placeholder="O que você está procurando?"
                type="text"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3">Encontrados na loja</span>
                </div>
                <ul className="max-h-[400px] overflow-y-auto">
                  {suggestions.map((product) => (
                    <li key={product.id}>
                      <button
                        onClick={() => selectSuggestion(product.id)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                      >
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                          <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-white truncate group-hover:text-primary transition-colors">{product.name}</h4>
                          <span className="text-xs text-gray-400 font-medium">{product.category}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 flex-shrink-0 relative">
            {!isLoggedIn ? (
              <>
                <Link to="/signup" className="text-gray-500 dark:text-gray-400 hover:underline text-sm font-medium">Cadastre-se</Link>
                <Link
                  to="/login"
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/30"
                >
                  Entrar
                </Link>
              </>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setShowCartModal(false); setShowProfileMenu(!showProfileMenu); }}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="hidden lg:block text-sm font-bold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">{user?.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800 py-2 z-50 overflow-hidden">
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/5 transition-colors font-bold"
                      >
                        <Settings className="w-4 h-4" />
                        Painel Admin
                      </Link>
                    )}
                    <Link
                      to="/meus-pedidos"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Package className="w-4 h-4 text-primary" />
                      Meus Pedidos
                    </Link>
                    <button
                      onClick={() => { logout(); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-gray-50 dark:border-gray-800"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={cartRef}>
              <button
                type="button"
                className="relative text-primary hover:text-primary-hover transition-colors ml-2"
                onClick={() => { setShowProfileMenu(false); setShowCartModal((v) => !v); }}
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
              {/* Dropdown do Carrinho */}
              {showCartModal && (
                <>
                  {/* Overlay só no mobile */}
                  <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setShowCartModal(false)} />
                  <div
                    className="z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col p-6
                    fixed left-1/2 top-1/2 w-[95vw] max-w-sm -translate-x-1/2 -translate-y-1/2
                    md:absolute md:right-0 md:top-full md:mt-2 md:w-80 md:max-w-xs md:left-auto md:translate-x-0 md:translate-y-0"
                  >
                    <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white text-center">Meu Carrinho</h2>
                    <div className="flex flex-col gap-3 mb-4 max-h-60 md:max-h-none md:overflow-y-visible overflow-y-auto">
                      {items.length === 0 ? (
                        <span className="text-center text-gray-400">Seu carrinho está vazio.</span>
                      ) : (
                        items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 border-b pb-2 last:border-b-0">
                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover border" />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-gray-800 dark:text-white truncate">{item.name}</div>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                                <span>Cor: <span className="font-semibold text-gray-700 dark:text-gray-200">{item.color}</span></span>
                                <span>Tam: <span className="font-semibold text-gray-700 dark:text-gray-200">{item.size}</span></span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                                <span>Qtd: <span className="font-semibold text-gray-700 dark:text-gray-200">{item.quantity}</span></span>
                                <span>Unit: <span className="font-semibold text-primary">R$ {item.price.toFixed(2)}</span></span>
                              </div>
                              <div className="text-xs text-gray-400 line-through">R$ {item.originalPrice?.toFixed(2)}</div>
                              <div className="text-sm font-bold text-primary mt-1">Total: R$ {(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-gray-700 dark:text-white">Valor total:</span>
                      <span className="font-bold text-lg text-primary">R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        className="flex-1 text-sm text-gray-500 underline hover:text-primary px-2 py-2"
                        onClick={() => { clearCart(); }}
                        disabled={items.length === 0}
                      >
                        Esvaziar
                      </button>
                      <button
                        className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors"
                        style={{ minWidth: '110px' }}
                        onClick={() => { setShowCartModal(false); navigate('/carrinho'); }}
                      >
                        Ver Carrinho
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Modal do Carrinho */}
            {/* O modal global foi removido, agora é dropdown no ícone do carrinho */}
          </div>
        </div>

        <nav className="container mx-auto px-4 lg:px-12 pb-0 pt-2 border-t border-gray-50 dark:border-gray-800/20">
          <ul className="flex items-center gap-10 overflow-x-auto hide-scrollbar py-2">
            <li><NavLink to="/" className={navLinkClasses}>Home</NavLink></li>
            <li><NavLink to="/produtos" className={navLinkClasses}>Produtos</NavLink></li>
            <li><NavLink to="/categorias" className={navLinkClasses}>Categorias</NavLink></li>
            <li><NavLink to="/meus-pedidos" className={navLinkClasses}>Meus Pedidos</NavLink></li>
          </ul>
        </nav>

        {/* Menu Mobile Overlay & Sidebar */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] md:hidden animate-in fade-in duration-300"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Sidebar */}
            <div className="fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-gray-900 z-[101] md:hidden p-6 shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between mb-8">
                <Logo variant="header" className="h-6" />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Área com scroll */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {/* Perfil do usuário */}
                {isLoggedIn && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{user?.name?.split(' ')[0]}</span>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Navegação</h3>
                  <nav className="flex flex-col gap-4">
                    <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `text-base font-bold transition-colors ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Home</NavLink>
                    <NavLink to="/produtos" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `text-base font-bold transition-colors ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Produtos</NavLink>
                    <NavLink to="/categorias" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `text-base font-bold transition-colors ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Categorias</NavLink>
                    <NavLink to="/meus-pedidos" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `text-base font-bold transition-colors ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Meus Pedidos</NavLink>
                    <NavLink to="/carrinho" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `text-base font-bold transition-colors flex items-center gap-2 ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                      Carrinho
                      {totalItems > 0 && (
                        <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">{totalItems}</span>
                      )}
                    </NavLink>
                  </nav>
                </div>

                {isLoggedIn && (
                  <div className="mb-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Opções da Conta</h3>
                    <div className="flex flex-col gap-4">
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-sm font-bold text-primary">
                          <Settings className="w-4 h-4" /> Painel Admin
                        </Link>
                      )}
                      <Link to="/favoritos" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-200">
                        <Heart className="w-4 h-4 text-red-500" /> Favoritos {favorites.length > 0 && <span className="text-xs text-gray-400">({favorites.length})</span>}
                      </Link>
                      <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center gap-3 text-sm font-bold text-red-500">
                        <LogOut className="w-4 h-4" /> Sair da Conta
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Botões Entrar/Cadastrar fixos no bottom */}
              {!isLoggedIn && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3 bg-white dark:bg-gray-900">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-primary text-white text-center py-3 rounded-lg font-bold shadow-lg shadow-primary/30">Entrar</Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-center py-3 rounded-lg font-bold">Cadastre-se</Link>
                </div>
              )}
            </div>
          </>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
