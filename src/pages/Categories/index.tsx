
import React from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { CATEGORIES } from '../constants';

const Categories: React.FC = () => {
  return (
    <div className="bg-[#F9F8FE] dark:bg-gray-950 min-h-screen py-10 transition-colors">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="mb-12 text-center lg:text-left">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-2">Categorias</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Navegue por estilo e encontre o que você procura</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {CATEGORIES.map((cat, idx) => {
            // Mapeamento do nome para o arquivo de imagem na pasta public/icons
            const iconMap: Record<string, string> = {
              'Camisetas': '/icons/camisa.png',
              'Calças': '/icons/calca.png',
              'Bonés': '/icons/boné.png',
              'Headphones': '/icons/fone.png',
              'Tênis': '/icons/tenis.png',
            };
            const iconSrc = iconMap[cat.name] || '/icons/camisa.png';

            return (
              <Link
                key={idx}
                to={`/produtos?categoria=${cat.name}`}
                className="group bg-white dark:bg-gray-900 rounded-[30px] p-10 shadow-sm border border-transparent dark:border-gray-800 hover:shadow-lg transition-all flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="w-24 h-24 rounded-full bg-[#F5F5F5] dark:bg-gray-900 flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors">
                  <img src={iconSrc} alt={cat.name} className="w-12 h-12 object-contain opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="text-lg font-bold text-[#1F2744] dark:text-gray-100 mb-4 transition-colors">
                  {cat.name}
                </h3>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#8F9BB3] group-hover:text-primary uppercase tracking-widest transition-colors">
                  Explorar <LucideIcons.ArrowRight className="w-3 h-3" />
                </div>

                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary/5 rounded-full"></div>
              </Link>
            );
          })}
        </div>

        {/* Seção de Destaque Adicional */}
        <div className="mt-20 bg-gradient-to-r from-primary to-primary-hover rounded-3xl p-10 lg:p-16 text-white flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-primary/20 relative overflow-hidden">
          <div className="lg:w-1/2 text-center lg:text-left z-10">
            <h2 className="text-3xl lg:text-4xl font-black mb-6">Não encontrou o que procurava?</h2>
            <p className="text-white/80 text-lg mb-8">
              Nossa coleção é atualizada semanalmente com os drops mais quentes do mercado. Fique de olho nas novidades!
            </p>
            <Link
              to="/produtos"
              className="bg-white text-primary font-bold py-4 px-10 rounded-xl hover:bg-gray-100 transition-colors inline-block uppercase tracking-wider text-sm"
            >
              Ver todos os produtos
            </Link>
          </div>
          <div className="lg:w-1/3 flex justify-center z-10">
            <LucideIcons.ShoppingBag className="w-40 h-40 opacity-20" />
          </div>

          {/* Decoração de fundo extra */}
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
