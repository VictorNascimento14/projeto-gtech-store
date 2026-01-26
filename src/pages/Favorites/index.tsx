import { useFavorites } from '../../contexts/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, AlertCircle } from 'lucide-react';

export const Favorites = () => {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleRemove = (productId: number) => {
    removeFavorite(productId);
  };

  const handleNavigateToProduct = (productId: number) => {
    navigate(`/produto/${productId}`);
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Meus Favoritos</h1>

          <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-lg p-12 shadow-lg dark:shadow-none border border-gray-200 dark:border-transparent">
            <Heart className="w-16 h-16 text-red-500 mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Nenhum favorito ainda</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Clique no ícone de coração em qualquer produto para adicioná-lo aos seus favoritos
            </p>
            <button
              onClick={() => navigate('/produtos')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Explorar Produtos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Meus Favoritos ({favorites.length})
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(({ product }) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden hover:shadow-xl dark:hover:shadow-lg shadow-md dark:shadow-none transition-shadow duration-300 border border-gray-200 dark:border-transparent"
            >
              {/* Product Image */}
              <div className="relative h-64 bg-gray-100 dark:bg-slate-700 cursor-pointer group overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onClick={() => handleNavigateToProduct(product.id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800">
                    <span className="text-gray-500 dark:text-gray-400">Imagem não disponível</span>
                  </div>
                )}

                {/* Out of Stock Badge */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-12 h-12 text-red-500" />
                      <span className="text-white font-bold text-lg">Fora de Estoque</span>
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(product.id)}
                  title="Remover dos favoritos"
                  aria-label={`Remover ${product.name} dos favoritos`}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 p-2 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Price and Stock */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-red-500 font-bold text-xl">
                      R$ {(product.price || 0).toFixed(2).replace('.', ',')}
                    </p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-gray-500 text-sm line-through">
                        R$ {(product.originalPrice || 0).toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    {product.stock > 0 ? (
                      <p className="text-green-600 dark:text-green-400 font-semibold text-sm">
                        {product.stock} em estoque
                      </p>
                    ) : (
                      <p className="text-red-500 dark:text-red-400 font-semibold text-sm">
                        Indisponível
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => handleNavigateToProduct(product.id)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors mb-2"
                  title="Ver detalhes do produto"
                >
                  Ver Detalhes
                </button>

                <button
                  onClick={() => handleRemove(product.id)}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  title="Remover dos favoritos"
                  aria-label={`Remover ${product.name} dos favoritos`}
                >
                  <Trash2 size={18} />
                  Remover dos favoritos
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
