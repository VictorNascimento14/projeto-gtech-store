
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Package, Truck, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';

const MyOrders: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const { orders } = useProducts();

  const userOrders = orders.filter(order => order.customerId === user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'shipped': return 'Em Trânsito';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center bg-[#F9F8FE] dark:bg-gray-950 transition-colors">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse text-primary">
          <Lock className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Acesso Restrito</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          Para visualizar seus pedidos e acompanhar suas entregas, você precisa estar conectado à sua conta.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/login"
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-12 rounded-xl transition-all shadow-lg shadow-primary/30 uppercase text-sm tracking-widest"
          >
            Fazer Login
          </Link>
          <Link
            to="/signup"
            className="bg-white dark:bg-gray-900 text-primary border border-primary font-bold py-3 px-12 rounded-xl hover:bg-primary/5 transition-all uppercase text-sm tracking-widest"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F8FE] dark:bg-gray-950 min-h-screen py-10 transition-colors">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Meus Pedidos</h1>
            <p className="text-gray-500 dark:text-gray-400">Acompanhe seus pedidos em andamento</p>
          </div>
        </div>

        <div className="space-y-6">
          {userOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-800 hover:border-primary/20 transition-all group">

              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                {/* Esquerda: Fotos e Resumo */}
                <div className="flex items-center gap-4">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-2 border border-gray-100 dark:border-gray-700 shrink-0">
                      <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                      +{order.items.length - 3}
                    </div>
                  )}
                  <div className="min-w-[100px]">
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {order.items.length} {order.items.length === 1 ? 'Produto' : 'Produtos'}
                    </div>
                    <button className="text-xs text-primary font-bold hover:underline flex items-center gap-1">Ver detalhes <ChevronRight className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Direita: Informações e Ações */}
                <div className="flex flex-1 flex-wrap items-center justify-between xl:justify-end gap-x-8 gap-y-4 pt-4 xl:pt-0 border-t xl:border-t-0 border-gray-50 dark:border-gray-800">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Pedido</div>
                    <div className="text-sm font-bold text-gray-800 dark:text-white">#{order.id}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Comprado em</div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Status</div>
                    <div className={`text-[10px] font-bold text-white px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>

                  <div className="space-y-1 text-right min-w-[80px]">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Total</div>
                    <div className="text-lg font-black text-primary">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>

                  <Link
                    to={`/rastreio/${order.id}`}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <Truck className="w-4 h-4 text-primary" />
                    Rastrear
                  </Link>
                </div>
              </div>

            </div>
          ))}

          {userOrders.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Você não possui pedidos em andamento.</p>
              <Link to="/produtos" className="text-primary font-bold hover:underline mt-2 inline-block">Começar a comprar</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
