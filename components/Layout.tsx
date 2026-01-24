
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useCart } from '../src/contexts/CartContext';
import { useAuth } from '../src/contexts/AuthContext';
import { useProducts } from '../src/contexts/ProductContext';
import { useFavorites } from '../src/contexts/FavoritesContext';
import { Product } from '../src/types';
import Logo from '../src/components/Logo';
import Footer from '../src/components/Footer';
import DarkModeToggle from '../src/components/DarkModeToggle';
import Header from '../src/components/Header';
import UserSidebar from '../src/components/UserSidebar';



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

  // Fecha o menu mobile quando a rota muda
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

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
      />

      <UserSidebar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isLoggedIn={isLoggedIn}
        user={user}
        logout={logout}
        totalItems={totalItems}
        favorites={favorites}
      />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div >
  );
};

export default Layout;
