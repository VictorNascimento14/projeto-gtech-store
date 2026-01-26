
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Outlet, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Product } from '../../types';
import Logo from '../Logo';
import Footer from '../Footer';
import DarkModeToggle from '../DarkModeToggle';
import Header from '../Header';
import UserSidebar from '../UserSidebar';
import Preloader from '../Preloader';
import { AnimatePresence, motion } from 'framer-motion';


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
  const [isAppLoading, setIsAppLoading] = useState(() => {
    return !sessionStorage.getItem('hasSeenPreloader');
  });
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    if (!isAppLoading) return;

    // Conecta com o LoadingManager do Three.js para rastrear modelos 3D
    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      setLoadProgress(prev => Math.max(prev, progress));
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      setLoadProgress(100);
    };

    // Fallback: se o Three.js não disparar (ex: sem modelos na home), 
    // libera após 2 segundos de qualquer forma para não travar o usuário
    const safetyTimer = setTimeout(() => {
      setLoadProgress(100);
    }, 5000);

    return () => {
      THREE.DefaultLoadingManager.onProgress = undefined;
      THREE.DefaultLoadingManager.onLoad = undefined;
      clearTimeout(safetyTimer);
    };
  }, [isAppLoading]);

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
    <>
      <AnimatePresence>
        {isAppLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[10000]"
          >
            <Preloader
              externalProgress={loadProgress}
              onLoadComplete={() => {
                setIsAppLoading(false);
                sessionStorage.setItem('hasSeenPreloader', 'true');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
      </div>
    </>
  );
};

export default Layout;
