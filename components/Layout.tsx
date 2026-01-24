
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Sun, Moon, LogOut, Package, ChevronDown, ArrowRight, Settings, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { Product } from '../types';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);

    // Verifica se o navegador suporta View Transitions API
    if (!document.startViewTransition) {
      // Fallback para navegadores que não suportam
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
      }
      return;
    }

    // Adiciona classe para desabilitar transições CSS durante a View Transition
    document.documentElement.classList.add('transitioning');

    // Usa a View Transitions API para transição suave
    const transition = document.startViewTransition(() => {
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
      }
    });

    // Remove a classe quando a transição terminar
    transition.finished.finally(() => {
      document.documentElement.classList.remove('transitioning');
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-[100] w-7 h-7 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all text-gray-600 dark:text-yellow-400"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

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

  // Fecha o menu mobile quando a rota muda
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
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

            <Link to="/" className="flex items-center gap-2 md:mx-0 mx-auto">
              <img src="/assets/logo-header.svg" alt="logo da página" className="h-7 md:h-auto" />
            </Link>

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
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
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

            <div className="relative">
              <button
                type="button"
                className="relative text-primary hover:text-primary-hover transition-colors ml-2"
                onClick={() => setShowCartModal((v) => !v)}
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
            <div className="fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-gray-900 z-[101] md:hidden shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
              <div className="flex items-center justify-between p-6 pb-0 mb-6">
                <img src="../public/assets/logo-header.svg" alt="Digital Store" className="h-6" />
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

      {/* Carrinho Flutuante Mobile - Apenas para usuários logados */}
      {isLoggedIn && (
        <button
          onClick={() => navigate('/carrinho')}
          className="md:hidden fixed bottom-6 left-6 z-50 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center text-primary hover:bg-white dark:hover:bg-gray-800 transition-colors animate-float-subtle"
          aria-label="Ver carrinho"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </button>
      )}

      <footer className="bg-dark-footer text-white py-16">
        <div className="container mx-auto px-4 lg:px-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Logo and Description */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <img src="../public/assets/logo-footer.svg" alt="Digital Store" className="h-8" />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Na Digital Store você encontra a melhor qualidade e preços acessíveis para você. <br />
                Temos uma ampla variedade de produtos para atender às suas necessidades. <br />
                Seja cliente ou vendedor, encontre aqui o que precisa. <br />
                Digital Store é a sua loja virtual.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Informação Column */}
            <div>
              <h3 className="font-bold text-lg mb-6">Informação</h3>
              <ul className="space-y-3">
                <li><Link to="https://digitalcollege.com.br/ouvidoria/" className="text-sm text-gray-400 hover:text-white transition-colors">Ouvidoria</Link></li>
                <li><Link to="https://digitalcollege.com.br/contato/" className="text-sm text-gray-400 hover:text-white transition-colors">Unidades</Link></li>
                <li><Link to="https://digitalcollege.com.br/blog/" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="https://digitalcollege.com.br/trabalhe-conosco/" className="text-sm text-gray-400 hover:text-white transition-colors">Trabalhe conosco</Link></li>
                <li><Link to="/meus-pedidos" className="text-sm text-gray-400 hover:text-white transition-colors">Meus Pedidos</Link></li>
              </ul>
            </div>

            {/* Categorias Column */}
            <div>
              <h3 className="font-bold text-lg mb-6">Categorias</h3>
              <ul className="space-y-3">
                <li><Link to="/produtos?categoria=Camisetas" className="text-sm text-gray-400 hover:text-white transition-colors">Camisetas</Link></li>
                <li><Link to="/produtos?categoria=Calças" className="text-sm text-gray-400 hover:text-white transition-colors">Calças</Link></li>
                <li><Link to="/produtos?categoria=Bonés" className="text-sm text-gray-400 hover:text-white transition-colors">Bonés</Link></li>
                <li><Link to="/produtos?categoria=Headphones" className="text-sm text-gray-400 hover:text-white transition-colors">Headphones</Link></li>
                <li><Link to="/produtos?categoria=Tênis" className="text-sm text-gray-400 hover:text-white transition-colors">Tênis</Link></li>
              </ul>
            </div>

            {/* Contato Column */}
            <div>
              <h3 className="font-bold text-lg mb-6">Contato</h3>
              <div className="space-y-4 text-sm text-gray-400">
                <p className="leading-relaxed">
                  Av. Santos Dumont, 1510 - 1 andar - Aldeota, Fortaleza - CE, 60150-161
                </p>
                <p>(85) 3051-3411</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-700 mb-6" />

          {/* Copyright */}
          <div className="text-center text-sm text-gray-500">
            <p>© 2026 Digital College. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
