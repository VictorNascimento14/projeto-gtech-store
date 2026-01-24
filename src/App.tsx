
import React, { useEffect, useLayoutEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MyOrders from './pages/MyOrders';
import Categories from './pages/Categories';
import AdminPanel from './pages/AdminPanel';
import Favorites from './pages/Favorites';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { FavoritesProvider } from './contexts/FavoritesContext';

import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<PageTransition><Home /></PageTransition>} />
          <Route path="produtos" element={<PageTransition><ProductListing /></PageTransition>} />
          <Route path="produto/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
          <Route path="carrinho" element={<PageTransition><Cart /></PageTransition>} />
          <Route path="meus-pedidos" element={<PageTransition><MyOrders /></PageTransition>} />
          <Route path="categorias" element={<PageTransition><Categories /></PageTransition>} />
          <Route path="admin" element={<PageTransition><AdminPanel /></PageTransition>} />
          <Route path="favoritos" element={<PageTransition><Favorites /></PageTransition>} />
        </Route>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <FavoritesProvider>
            <Router>
              <ScrollToTop />
              <AnimatedRoutes />
            </Router>
          </FavoritesProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default App;
