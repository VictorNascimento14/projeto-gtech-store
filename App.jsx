
import React, { useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './src/components/Layout';
import { CartProvider } from './src/contexts/CartContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProductProvider } from './src/contexts/ProductContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './src/components/PageTransition';

// Lazy loading pages for performance
const Home = lazy(() => import('./src/pages/Home'));
const ProductListing = lazy(() => import('./src/pages/ProductListing'));
const ProductDetail = lazy(() => import('./src/pages/ProductDetail'));
const Cart = lazy(() => import('./src/pages/Cart'));
const Login = lazy(() => import('./src/pages/Login'));
const SignUp = lazy(() => import('./src/pages/SignUp'));
const MyOrders = lazy(() => import('./src/pages/MyOrders'));
const Categories = lazy(() => import('./src/pages/Categories'));
const AdminPanel = lazy(() => import('./src/pages/AdminPanel'));
const Favorites = lazy(() => import('./src/pages/Favorites'));
const OrderTracking = lazy(() => import('./src/pages/OrderTracking'));
const OrderDetails = lazy(() => import('./src/pages/OrderDetails'));

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
      <Suspense fallback={null}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Layout />}>
            <Route index element={<PageTransition><Home /></PageTransition>} />
            <Route path="produtos" element={<PageTransition><ProductListing /></PageTransition>} />
            <Route path="produto/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
            <Route path="carrinho" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="meus-pedidos" element={<PageTransition><MyOrders /></PageTransition>} />
            <Route path="meus-pedidos/:id" element={<PageTransition><OrderDetails /></PageTransition>} />
            <Route path="rastreio/:id" element={<PageTransition><OrderTracking /></PageTransition>} />
            <Route path="categorias" element={<PageTransition><Categories /></PageTransition>} />
            <Route path="favoritos" element={<PageTransition><Favorites /></PageTransition>} />
            <Route path="admin" element={<PageTransition><AdminPanel /></PageTransition>} />
          </Route>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => {
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
