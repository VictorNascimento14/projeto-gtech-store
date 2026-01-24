import React, { useEffect, useState } from 'react';
import { ShoppingBag, Package, Zap, Sparkles } from 'lucide-react';

const Preloader: React.FC<{ onLoadComplete: () => void }> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Simula o carregamento progressivo
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onLoadComplete(), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Muda os estágios visuais
    const stageInterval = setInterval(() => {
      setStage(prev => (prev + 1) % 3);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center overflow-hidden">
      {/* Partículas de fundo animadas */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-float-particles"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>

      {/* Grid de fundo tecnológico */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Círculos concêntricos animados */}
      <div className="absolute">
        <div className="w-[400px] h-[400px] border-2 border-primary/20 rounded-full animate-ping-slow" />
        <div className="absolute inset-0 w-[400px] h-[400px] border-2 border-primary/10 rounded-full animate-ping-slower" 
             style={{ animationDelay: '0.5s' }} />
        <div className="absolute inset-0 w-[400px] h-[400px] border border-primary/5 rounded-full animate-ping-slowest" 
             style={{ animationDelay: '1s' }} />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Logo/Ícone animado */}
        <div className="relative">
          {/* Brilho de fundo */}
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
          
          {/* Ícones rotativos */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className={`absolute transition-all duration-500 ${stage === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <ShoppingBag className="w-16 h-16 text-primary animate-bounce-slow" />
            </div>
            <div className={`absolute transition-all duration-500 ${stage === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <Package className="w-16 h-16 text-primary animate-bounce-slow" />
            </div>
            <div className={`absolute transition-all duration-500 ${stage === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <Zap className="w-16 h-16 text-primary animate-bounce-slow" />
            </div>
            
            {/* Anel rotativo externo */}
            <div className="absolute w-28 h-28 border-2 border-t-primary border-r-primary/50 border-b-transparent border-l-transparent rounded-full animate-spin" />
            <div className="absolute w-24 h-24 border-2 border-t-transparent border-r-transparent border-b-primary/50 border-l-primary rounded-full animate-spin-reverse" />
          </div>
        </div>

        {/* Texto animado */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <span className={`transition-all duration-300 ${stage === 0 ? 'text-primary scale-110' : 'text-white'}`}>D</span>
            <span className={`transition-all duration-300 ${stage === 1 ? 'text-primary scale-110' : 'text-white'}`}>i</span>
            <span className={`transition-all duration-300 ${stage === 2 ? 'text-primary scale-110' : 'text-white'}`}>g</span>
            <span className={`transition-all duration-300 ${stage === 0 ? 'text-primary scale-110' : 'text-white'}`}>i</span>
            <span className={`transition-all duration-300 ${stage === 1 ? 'text-primary scale-110' : 'text-white'}`}>t</span>
            <span className={`transition-all duration-300 ${stage === 2 ? 'text-primary scale-110' : 'text-white'}`}>a</span>
            <span className={`transition-all duration-300 ${stage === 0 ? 'text-primary scale-110' : 'text-white'}`}>l</span>
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <span className={`transition-all duration-300 ${stage === 1 ? 'text-primary scale-110' : 'text-white'}`}>S</span>
            <span className={`transition-all duration-300 ${stage === 2 ? 'text-primary scale-110' : 'text-white'}`}>t</span>
            <span className={`transition-all duration-300 ${stage === 0 ? 'text-primary scale-110' : 'text-white'}`}>o</span>
            <span className={`transition-all duration-300 ${stage === 1 ? 'text-primary scale-110' : 'text-white'}`}>r</span>
            <span className={`transition-all duration-300 ${stage === 2 ? 'text-primary scale-110' : 'text-white'}`}>e</span>
          </h2>
          
          <p className="text-gray-400 text-sm font-medium animate-pulse">
            {stage === 0 && 'Preparando sua experiência de compra...'}
            {stage === 1 && 'Carregando os melhores produtos...'}
            {stage === 2 && 'Quase lá! Últimos ajustes...'}
          </p>
        </div>

        {/* Barra de progresso moderna */}
        <div className="w-80 space-y-3">
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            {/* Barra de progresso com gradiente */}
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-pink-500 to-primary bg-[length:200%_100%] animate-gradient-x rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            
            {/* Brilho na barra */}
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          {/* Porcentagem */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-bold uppercase tracking-wider">Carregando</span>
            <span className="text-primary font-black text-lg tabular-nums">
              {Math.min(Math.floor(progress), 100)}%
            </span>
          </div>
        </div>

        {/* Pontos de loading animados */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      {/* Efeito de scan line */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default Preloader;
