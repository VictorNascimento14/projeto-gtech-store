import React from 'react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToCart: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onGoToCart }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-xs w-full flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white text-center">Produto adicionado ao carrinho!</h2>
        <div className="flex flex-col gap-3 w-full mt-2">
          <button
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors mb-2"
            onClick={onGoToCart}
          >
            Ir para o carrinho
          </button>
          <button
            className="w-full py-3 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary/10 transition-colors"
            onClick={onClose}
          >
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
