
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Sun, Moon, LogOut, Package, ChevronDown, ArrowRight, Settings, Menu, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { Product } from '../src/types';
import Logo from '../src/components/Logo';
import Footer from '../src/components/Footer';
import DarkModeToggle from '../src/components/DarkModeToggle';
import Header from '../src/components/Header';


const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const { products } = useProducts();
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

      <Header 
        setIsMenuOpen={setIsMenuOpen}
        isLoggedIn={isLoggedIn}
        user={user}
        logout={logout}
        totalItems={totalItems}
        products={products}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        handleInputChange={handleInputChange}
        handleSearch={handleSearch}
        selectSuggestion={selectSuggestion}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        searchRef={searchRef}
      />

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

              <div className="mb-8">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Minha Loja</h3>
                <div className="flex items-center gap-6">
                  {/* Cart Mobile */}
                  <Link to="/carrinho" onClick={() => setIsMenuOpen(false)} className="relative text-primary p-2 bg-primary/5 rounded-xl border border-primary/10">
                    <ShoppingCart className="w-6 h-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-gray-900">
                        {totalItems}
                      </span>
                    )}
                  </Link>

                  {/* Profile Mobile */}
                  {isLoggedIn ? (
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{user?.name.split(' ')[0]}</span>
                    </div>
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Navegação</h3>
                <nav className="flex flex-col gap-4">
                  <NavLink to="/" className={({ isActive }) => `text-base font-bold transition-colors ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Home</NavLink>
                  <NavLink to="/produtos" className={({ isActive }) => `text-base font-bold transition-colors ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Produtos</NavLink>
                  <NavLink to="/categorias" className={({ isActive }) => `text-base font-bold transition-colors ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Categorias</NavLink>
                  <NavLink to="/meus-pedidos" className={({ isActive }) => `text-base font-bold transition-colors ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>Meus Pedidos</NavLink>
                </nav>
              </div>

              {isLoggedIn && (
                <div className="mb-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Opções da Conta</h3>
                  <div className="flex flex-col gap-4">
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-sm font-bold text-primary">
                        <Settings className="w-4 h-4" /> Painel Admin
                      </Link>
                    )}
                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center gap-3 text-sm font-bold text-red-500">
                      <LogOut className="w-4 h-4" /> Sair da Conta
                    </button>
                  </div>
                </div>
              )}

              {!isLoggedIn && (
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                  <Link to="/login" className="w-full bg-primary text-white text-center py-3 rounded-lg font-bold shadow-lg shadow-primary/30">Entrar</Link>
                  <Link to="/signup" className="w-full bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-center py-3 rounded-lg font-bold">Cadastre-se</Link>
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
    </div >
  );
};

export default Layout;
