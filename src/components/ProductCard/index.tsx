
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/produto/${product.id}`} className="group cursor-pointer">
      <div className="bg-white dark:bg-gray-900 rounded shadow-sm dark:shadow-2xl dark:border dark:border-gray-800 p-4 h-64 flex items-center justify-center relative mb-4 group-hover:shadow-md dark:group-hover:border-primary/30 transition-all">
        {product.discount && (
          <span className="absolute top-4 left-4 bg-accent-yellow text-gray-800 text-xs font-bold px-3 py-1 rounded-full z-10">
            {product.discount}
          </span>
        )}
        <img 
          alt={product.name} 
          className="max-h-40 object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply dark:mix-blend-normal" 
          src={product.image} 
        />
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
