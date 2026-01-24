
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, Filter } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { CATEGORIES } from '../../constants';
import { useProducts } from '../../contexts/ProductContext';

const ProductListing: React.FC = () => {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('categoria');
  const searchFilter = searchParams.get('search')?.toLowerCase() || '';

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevantes');

  // Sincroniza filtros iniciais da URL
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    } else {
      setSelectedCategories([]);
    }
  }, [initialCategory]);

  const toggleCategory = (catName: string) => {
    setSelectedCategories(prev =>
      prev.includes(catName)
        ? prev.filter(c => c !== catName)
        : [...prev, catName]
    );
  };

  const filteredProducts = useMemo(() => {
    let results = [...products];

    // 1. Filtro de Texto (Barra de pesquisa)
    if (searchFilter) {
      results = results.filter(p =>
        p.name.toLowerCase().includes(searchFilter) ||
        p.category.toLowerCase().includes(searchFilter)
      );
    }

    // 2. Filtro de Categorias (Checkbox)
    if (selectedCategories.length > 0) {
      results = results.filter(p => selectedCategories.includes(p.category));
    }

    // 3. Ordenação
    if (sortBy === 'menor') {
      results = results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'maior') {
      results = results.sort((a, b) => b.price - a.price);
    }

    return results;
  }, [products, selectedCategories, searchFilter, sortBy]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchParams({}); // Limpa a URL
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 lg:px-12 dark:bg-gray-950 min-h-screen pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="text-sm">
            <span className="font-bold text-gray-700 dark:text-gray-200">
              {searchFilter ? `Resultados para "${searchFilter}"` : 'Todos os produtos'}
            </span>
            <span className="text-gray-400"> - {filteredProducts.length} produtos</span>
          </div>
          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm">
            <span className="font-bold text-xs mr-2 whitespace-nowrap text-gray-500 uppercase tracking-tighter">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-sm p-0 pr-8 focus:ring-0 cursor-pointer text-gray-900 dark:text-white font-medium"
            >
              <option value="relevantes" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Relevância</option>
              <option value="menor" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Menor Preço</option>
              <option value="maior" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Maior Preço</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm h-fit border border-transparent dark:border-gray-800">
            <div className="flex items-center gap-2 mb-6 border-b dark:border-gray-800 pb-3">
              <Filter className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-lg dark:text-white">Filtrar por</h3>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-sm mb-4 dark:text-gray-300 uppercase tracking-widest text-[10px] text-gray-400">Categoria</h4>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => (
                  <label key={cat.name} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => toggleCategory(cat.name)}
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-700 bg-transparent text-primary focus:ring-primary transition-all cursor-pointer"
                        type="checkbox"
                      />
                    </div>
                    <span className={`text-sm transition-colors ${selectedCategories.includes(cat.name) ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-400 group-hover:text-primary'}`}>
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {(selectedCategories.length > 0 || searchFilter) && (
              <button
                onClick={clearFilters}
                className="w-full py-2 text-xs font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
              >
                Limpar Filtros
              </button>
            )}
          </aside>

          <div className="flex-grow">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <SearchX className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-lg font-medium text-gray-500">Nenhum produto encontrado.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary font-bold hover:underline"
                >
                  Ver todos os produtos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
