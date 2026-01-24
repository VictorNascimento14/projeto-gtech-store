
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signUp(email, password, name, birthdate);

    if (error) {
      alert(error.message || 'Erro ao criar conta');
    } else {
      alert('Conta criada com sucesso! Verifique seu email se necessário.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8FE] dark:bg-gray-950 transition-colors">
      <header className="py-6 container mx-auto px-4 lg:px-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary rounded-md p-2 text-white">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-primary font-bold text-2xl tracking-tight">Digital Store</span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-gradient-to-b from-[#B5B6F2]/30 to-[#EFEFFF] dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-all mb-6 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Voltar para Home</span>
            </Link>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border border-transparent dark:border-gray-800">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Crie sua conta</h1>
              <p className="text-sm text-gray-400 mb-8">
                Já possui uma conta? Entre <Link to="/login" className="underline text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">aqui</Link>.
              </p>

              <form onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome Completo *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all outline-none"
                    placeholder="Seu nome completo"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Data de Nascimento *</label>
                  <input
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all outline-none"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all outline-none"
                    placeholder="Insira seu email"
                    type="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Senha *</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all outline-none"
                    placeholder="Insira sua senha"
                    type="password"
                    required
                  />
                </div>
                <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/30 uppercase tracking-widest text-sm" type="submit">
                  Criar Conta
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm mb-4">Ou faça login com</p>
                <div className="flex justify-center gap-4">
                  <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <img alt="Google" className="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYsByYrhmanUTN17992A2U-cJ49GH1C2iVcHO1sEjxQKk0yKD9BuCHjO3dDVAzG6nLyA2D9bistKU8kRC7vzA_KyYEkXBRmw6JxQTDn54Xp023xEjJXISk8WfkMEKFFPhrUdDbGxEH4xsatLtNqnTw1474Tt2485Y7Zl1yMKHTDQHdhXZESNx-JHdseHSBTrYH85l7fGWSVQ-hokgIS_37P48nfoJKcbOETkN-uc8CuGXoPpNDrKxEinKPYavMnjDAEtuGFasAUGg" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex relative h-[600px] w-full items-center justify-center">
            <img
              alt="Top sneaker"
              className="absolute top-0 right-10 w-64 object-contain transform -rotate-12 drop-shadow-2xl z-10 animate-float mix-blend-multiply dark:mix-blend-normal"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0qUckuxwdzXpMc8JjQJ5XF8DV6huFa5CUUKqqHRKl1D1AJwxfHDUNfDN52UdeOnxqEpOdMUxPBzAY0tzTey7PYGWtJu3Q_jgC1ZkLe8XROenYliYWsiJ--u0Qa7JG8PXapNyaCvuWEhFTui5Ki030q5dFnF8Fsv-lnqsw5hjjiuX9WSh47QgNICfpNkCsgfP5HbBjFQp9sHFDbuXR2q9QYUE108va57KyHDARnAjMlWyHvFUONoq_tPSDw2T02ypsHuzSDhZ1WkM"
            />
          </div>
        </div>
      </main>

      <footer className="bg-dark-footer text-white py-12 mt-auto">
        <div className="container mx-auto px-4 lg:px-20 text-center">
          <p className="text-xs text-gray-500 opacity-50">@ 2025 Digital Store COLLEGE</p>
        </div>
      </footer>
    </div>
  );
};

export default SignUp;
