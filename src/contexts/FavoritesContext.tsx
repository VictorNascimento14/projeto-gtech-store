import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

interface FavoriteItem {
  product: Product;
  addedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_KEY = 'gtech_favorites';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Carregar favoritos do localStorage APENAS na montagem
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = window.localStorage.getItem(FAVORITES_KEY);
        console.log('localStorage raw:', stored);
        
        if (stored) {
          const parsed = JSON.parse(stored) as FavoriteItem[];
          console.log('Favoritos carregados do localStorage:', parsed.length, 'items');
          setFavorites(parsed);
        } else {
          console.log('Nenhum favorito encontrado no localStorage');
          setFavorites([]);
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        window.localStorage.removeItem(FAVORITES_KEY);
        setFavorites([]);
      }
      setInitialized(true);
    };

    loadFavorites();
  }, []);

  // Salvar favoritos no localStorage SEMPRE que mudarem
  useEffect(() => {
    if (initialized) {
      try {
        const toStore = JSON.stringify(favorites);
        window.localStorage.setItem(FAVORITES_KEY, toStore);
        console.log('Salvando favoritos:', favorites.length, 'items');
      } catch (error) {
        console.error('Erro ao salvar favoritos no localStorage:', error);
      }
    }
  }, [favorites, initialized]);

  const addFavorite = useCallback((product: Product) => {
    setFavorites(prev => {
      const exists = prev.some(fav => fav.product.id === product.id);
      if (exists) {
        console.log('Produto já está nos favoritos:', product.id);
        return prev;
      }
      
      const newFavorite: FavoriteItem = {
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          image: product.image,
          description: product.description,
          availableSizes: product.availableSizes,
          stock: product.stock
        },
        addedAt: new Date().toISOString()
      };
      
      console.log('Adicionado aos favoritos:', product.name);
      return [...prev, newFavorite];
    });
  }, []);

  const removeFavorite = useCallback((productId: number) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(fav => fav.product.id !== productId);
      console.log('Removido dos favoritos:', productId, 'Restantes:', newFavorites.length);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((productId: number): boolean => {
    return favorites.some(fav => fav.product.id === productId);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        clearFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites deve ser usado dentro de FavoritesProvider');
  }
  return context;
};
