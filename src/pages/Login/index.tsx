
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Store, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await login(email, password);

    if (error) {
      alert(error.message || 'Erro ao fazer login');
      return;
    }

    // Redireciona para home após login bem-sucedido
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8FE] dark:bg-gray-950 transition-colors">
      <header className="py-6 container mx-auto px-4 lg:px-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary rounded-md p-1.5 text-white">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-primary font-bold text-2xl tracking-tight">Digital Store</span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-gradient-to-b from-[#B5B6F2]/30 to-[#EFEFFF] dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-all mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Voltar para Home</span>
            </Link>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border border-transparent dark:border-gray-800 transition-all duration-300">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">Acesse sua conta</h1>
              <p className="text-sm text-gray-500 mb-8 text-center">
                Entre com seu e-mail e senha para continuar.
              </p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">E-mail *</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="seu@email.com"
                    type="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Senha *</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Sua senha"
                    type="password"
                    required
                  />
                </div>
                <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transform active:scale-95" type="submit">
                  <LogIn className="w-5 h-5" />
                  Acessar Conta
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800">
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-500">Ainda não tem uma conta?</p>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center w-full py-3 px-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300 active:scale-95"
                  >
                    Criar Nova Conta
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex relative justify-center items-center h-full min-h-[500px]">
            <img
              alt="Digital Store Banner"
              className="w-full max-w-md object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] animate-float"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8lMnOhP0xlawlbrMpfcvLNdLW1rJB9xdp52K8RlHHPyABCN5-MaOhMzOE2BUr4iuiRlmZ03KOsr2y-UvRf8qmNHrhpwBFABoGvf3JpWhdwB_Ya9UoWRvN5o7v55XCLCrsalaLla3KJcJDffXoVp7vsA7XD5bMwTfmPqLPpqnanq76SUH3uz6KF3auCDWxA8IeHidH9YvdIBuQPi8l825k_lC1kAguVuIjnN8BBU5TjUWMPIyGpucWYe2OhG3a0nqlm_-IKQL78h4"
            />
          </div>
        </div>
      </main>

      <footer className="bg-dark-footer text-white py-12 pb-8 mt-auto">
        <div className="container mx-auto px-4 lg:px-20 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold opacity-50">Digital Store - Conectando você ao amanhã</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
