
import React, { useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Package, ChevronDown, ArrowRight, Settings, Menu, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import { Product } from '../../types';
import Logo from '../Logo';

interface HeaderProps {
    setIsMenuOpen: (isOpen: boolean) => void;
    isLoggedIn: boolean;
    user: any;
    logout: () => Promise<void>;
    totalItems: number;
    products: Product[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    suggestions: Product[];
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSearch: (e: React.FormEvent) => void;
    selectSuggestion: (id: number) => void;
    showProfileMenu: boolean;
    setShowProfileMenu: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
    setIsMenuOpen,
    isLoggedIn,
    user,
    logout,
    totalItems,
    searchTerm,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleInputChange,
    handleSearch,
    selectSuggestion,
    showProfileMenu,
    setShowProfileMenu
}) => {
    const searchRef = useRef<HTMLDivElement>(null);

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `transition-all duration-200 whitespace-nowrap pb-[2px] border-b-2 text-base tracking-tight inline-block ${isActive
            ? 'text-primary border-primary font-bold'
            : 'text-[#474747] dark:text-gray-400 border-transparent hover:text-primary font-normal'
        }`;

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
            <div className="container mx-auto px-4 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 flex-shrink-0">
                    {/* Menu Hambúrguer - Mobile Only */}
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

                <div className="hidden md:flex items-center gap-6 flex-shrink-0 relative">
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

                    <Link to="/carrinho" className="relative text-primary hover:text-primary-hover transition-colors ml-2">
                        <ShoppingCart className="w-6 h-6" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            <nav className="hidden md:block container mx-auto px-4 lg:px-12 pb-0 pt-2 border-t border-gray-50 dark:border-gray-800/20">
                <ul className="flex items-center gap-10 overflow-x-auto hide-scrollbar py-2">
                    <li><NavLink to="/" className={navLinkClasses}>Home</NavLink></li>
                    <li><NavLink to="/produtos" className={navLinkClasses}>Produtos</NavLink></li>
                    <li><NavLink to="/categorias" className={navLinkClasses}>Categorias</NavLink></li>
                    <li><NavLink to="/meus-pedidos" className={navLinkClasses}>Meus Pedidos</NavLink></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
