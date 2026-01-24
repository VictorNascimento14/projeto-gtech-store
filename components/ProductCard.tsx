
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorited = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (favorited) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  return (
    <Link to={`/produto/${product.id}`} className="group cursor-pointer">
      <div className="bg-white dark:bg-gray-900 rounded shadow-sm dark:shadow-2xl dark:border dark:border-gray-800 p-4 h-64 flex items-center justify-center relative mb-4 group-hover:shadow-md dark:group-hover:border-primary/30 transition-all overflow-hidden">
        {product.discount && (
          <span className="absolute top-4 left-4 bg-accent-yellow text-gray-800 text-xs font-bold px-3 py-1 rounded-full z-10">
            {product.discount}
          </span>
        )}
        
        {/* Out of Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-1">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <span className="text-white text-xs font-bold">Fora de Estoque</span>
            </div>
          </div>
        )}
        
        <img 
          alt={product.name} 
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 mix-blend-multiply dark:mix-blend-normal ${product.stock === 0 ? 'opacity-60' : ''}`}
          src={product.image} 
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          title={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all z-30 opacity-0 group-hover:opacity-100
            ${favorited 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
              : 'bg-white hover:bg-gray-100 text-red-500 shadow-lg'}
          `}
        >
          <Heart 
            size={20} 
            className={favorited ? 'fill-current' : ''}
            aria-hidden="true"
          />
        </button>
      </div>
      <p className="text-xs text-gray-400 font-bold mb-1">{product.category}</p>
      <h4 className="text-lg font-light text-gray-600 dark:text-gray-300 mb-2 truncate">{product.name}</h4>
      <div className="flex items-center gap-2">
        <span className="text-gray-400 line-through text-lg">R$ {product.originalPrice},00</span>
        <span className="text-gray-800 dark:text-white font-bold text-lg">R$ {product.price},00</span>
      </div>
    </Link>
  );
};

export default ProductCard;
