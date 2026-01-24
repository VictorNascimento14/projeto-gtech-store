
import React, { Suspense, useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Environment, Stage, Html } from '@react-three/drei';
import * as LucideIcons from 'lucide-react';
import gsap from 'gsap';
import * as THREE from 'three';
import ProductCard from '../../components/ProductCard';
import Preloader from '../../components/Preloader';
import { CATEGORIES } from '../../constants';
import { useProducts } from '../../contexts/ProductContext';

const AVAILABLE_MODELS = [
  {
    id: 'nike-pegasus-36',
    name: 'Nike Air Zoom Pegasus 36',
    url: '/nike_air_zoom_pegasus_36/scene.gltf',
    scale: 1.3,
    position: [0, -15, 0],
    description: 'O tênis perfeito para corridas longas. Com tecnologia Zoom Air na parte dianteira e traseira, oferece amortecimento responsivo e durável. Seu design aerodinâmico combina performance e estilo.',
    price: 'R$ 899,90',
    tag: 'Best Seller'
  },
  {
    id: 'JBL Tour one m2',
    name: 'JBL tour one m2',
    url: '/jbl_tour/scene.gltf',
    scale: 8.5,
    position: [0, 0, 0],
    description: 'A tecnologia de Cancelamento de Ruído Adaptativo do JBL Tour One M2 elimina distrações para que você possa curtir suas músicas favoritas, ou até mesmo o silêncio, tudo com o lendário JBL Pro Sound de alta resolução. Mergulhe em um áudio espacial incrível em qualquer lugar por até 50 horas ou aproveite a clareza da tecnologia de 4 microfones enquanto fala ao telefone.',
    price: 'R$ 1899,90',
    tag: 'Novo'
  },
];

class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onRetry: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Erro ao carregar modelo 3D:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-sm font-bold">Falha ao carregar o modelo 3D</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onRetry();
              }}
              className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold"
              type="button"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Preload dos modelos 3D (carrega em background)
AVAILABLE_MODELS.forEach(model => {
  useGLTF.preload(model.url);
});

// Componente para limpar recursos do WebGL quando o Canvas é desmontado
const ResourceCleanup: React.FC = () => {
  const { gl } = useThree();

  useEffect(() => {
    return () => {
      gl.dispose();
    };
  }, [gl]);

  return null;
};

const SneakerModel: React.FC<{
  modelUrl: string;
  scale: number;
  position: [number, number, number];
  modelId: string;
  onLoaded?: () => void;
}> = ({ modelUrl, scale, position, modelId, onLoaded }) => {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null!);
  const [isReady, setIsReady] = useState(false);

  // Clone a cena para evitar problemas de compartilhamento de geometria
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    // Otimiza materiais para melhor performance
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = true;
        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.needsUpdate = true;
        }
      }
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    if (groupRef.current && clonedScene) {
      // Começa com o tamanho correto para evitar o modelo aparecer pequeno
      groupRef.current.scale.set(scale, scale, scale);
      setIsReady(true);

      // Pequeno delay para callback de carregamento
      const timer = requestAnimationFrame(() => {
        if (groupRef.current) {
          onLoaded?.();
        }
      });

      return () => cancelAnimationFrame(timer);
    }
  }, [modelId, scale, clonedScene, onLoaded]);

  // Limpa recursos quando o componente é desmontado
  useEffect(() => {
    return () => {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, [clonedScene]);

  useFrame((state, delta) => {
    if (groupRef.current && isReady) {
      // Rotação lenta e contínua
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  if (!clonedScene) return null;

  return (
    <group ref={groupRef} position={position}>
      <primitive object={clonedScene} />
    </group>
  );
};

const Sneaker3DView: React.FC<{ currentModel: typeof AVAILABLE_MODELS[0]; modelKey: string }> = ({ currentModel, modelKey }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const retry = useCallback(() => {
    // Limpa cache do GLTF e força remontagem do Canvas
    try {
      useGLTF.clear(currentModel.url);
    } catch {
      // noop
    }
    setRetryKey((k) => k + 1);
  }, [currentModel.url]);

  const handleModelLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Reset loading state quando o modelo muda
  useEffect(() => {
    setIsLoading(true);
  }, [modelKey]);

  return (
    <div ref={containerRef} className="w-full h-[450px] lg:h-[550px] relative group">
      {/* Indicador de loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Carregando modelo...</span>
          </div>
        </div>
      )}

      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <ModelErrorBoundary onRetry={retry} key={`error-${modelKey}-${retryKey}`}>
          <Canvas
            key={`canvas-${modelKey}-${retryKey}`}
            shadows
            camera={{ position: [4, 2, 1], fov: 40 }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false,
            }}
            dpr={[1, 1.5]}
            frameloop="always"
            performance={{ min: 0.5 }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
          >
            <ResourceCleanup />
            <Suspense
              fallback={
                <Html center>
                  <div className="text-gray-400 text-xs font-bold">Carregando 3D...</div>
                </Html>
              }
            >
              <Stage environment="city" intensity={0.5} shadows={false} adjustCamera={false}>
                <SneakerModel
                  key={`model-${modelKey}-${retryKey}`}
                  modelId={`${modelKey}-${retryKey}`}
                  modelUrl={currentModel.url}
                  scale={currentModel.scale}
                  position={currentModel.position as [number, number, number]}
                  onLoaded={handleModelLoaded}
                />
              </Stage>
              <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
            </Suspense>
            <Environment preset="city" />
            <OrbitControls
              enableZoom={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
              enableDamping
              dampingFactor={0.05}
            />
          </Canvas>
        </ModelErrorBoundary>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-gray-300 pointer-events-none">
        <LucideIcons.RotateCw className="w-4 h-4 animate-spin-slow" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Explore em 360°</span>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { products, heroSlides, loading: contextLoading } = useProducts();
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isModelTransitioning, setIsModelTransitioning] = useState(false);
  const currentModel = AVAILABLE_MODELS[currentModelIndex];
  const currentSlide = heroSlides.length > 0 ? (heroSlides[currentHeroSlide] || heroSlides[0]) : null;

  // Auto-play do carrossel hero com transição suave
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
        setIsFading(false);
      }, 300);
    }, 20000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Auto-play dos modelos 3D com transição fade
  useEffect(() => {
    const interval = setInterval(() => {
      setIsModelTransitioning(true);
      setTimeout(() => {
        setCurrentModelIndex((prev) => (prev + 1) % AVAILABLE_MODELS.length);
        setTimeout(() => {
          setIsModelTransitioning(false);
        }, 50);
      }, 500);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!currentSlide) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const nextModel = () => {
    setIsModelTransitioning(true);
    setTimeout(() => {
      setCurrentModelIndex((prev) => (prev + 1) % AVAILABLE_MODELS.length);
      setTimeout(() => setIsModelTransitioning(false), 50);
    }, 500);
  };

  const prevModel = () => {
    setIsModelTransitioning(true);
    setTimeout(() => {
      setCurrentModelIndex((prev) => (prev - 1 + AVAILABLE_MODELS.length) % AVAILABLE_MODELS.length);
      setTimeout(() => setIsModelTransitioning(false), 50);
    }, 500);
  };

  const goToModel = (index: number) => {
    if (index === currentModelIndex) return;
    setIsModelTransitioning(true);
    setTimeout(() => {
      setCurrentModelIndex(index);
      setTimeout(() => setIsModelTransitioning(false), 50);
    }, 500);
  };

  const goToHeroSlide = (index: number) => {
    if (index === currentHeroSlide) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentHeroSlide(index);
      setIsFading(false);
    }, 300);
  };

  return (
    <div className="w-full overflow-x-hidden transition-colors">
      {/* Hero Carrossel */}
      <section className={`${currentSlide.bgColor} ${currentSlide.bgDark} py-20 lg:py-24 relative overflow-hidden transition-colors duration-500`}>
        {/* Decoração de fundo com pontinhos */}
        <div className="absolute top-4 right-4 lg:top-8 lg:right-8 w-32 h-32 lg:w-40 lg:h-40 opacity-20">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary" />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-12 flex flex-col-reverse lg:flex-row items-center justify-between relative gap-12 lg:gap-0">
          <div className={`lg:w-1/2 z-10 text-center lg:text-left transition-all duration-300 ${isFading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <span className="text-primary font-bold text-sm tracking-widest mb-3 block uppercase">
              {currentSlide.tag}
            </span>
            <h1 className="text-3xl lg:text-6xl font-extrabold text-[#1F1F1F] dark:text-white leading-tight mb-6">
              {currentSlide.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base lg:text-lg mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
              {currentSlide.description}
            </p>
            <Link
              to={currentSlide.buttonLink}
              className="bg-primary hover:bg-primary-hover text-white px-10 py-3 rounded-lg font-bold text-base transition-transform transform hover:scale-105 shadow-xl shadow-primary/30 inline-block"
            >
              {currentSlide.buttonText}
            </Link>
          </div>
          <div className={`lg:w-1/2 relative flex justify-center lg:justify-center transition-all duration-300 ${isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} px-6 lg:px-0`}>
            <img
              key={currentSlide.id}
              alt={currentSlide.title}
              className="w-full max-w-[340px] lg:max-w-[500px] object-contain animate-float drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal rounded-3xl"
              src={currentSlide.image}
            />
          </div>
        </div>

        {/* Indicadores de slide */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToHeroSlide(index)}
              className={`transition-all rounded-full ${index === currentHeroSlide
                ? 'w-8 h-3 bg-primary'
                : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Coleções em Destaque */}
      <section className="py-12 bg-[#F5F5F5] dark:bg-gray-900">
        <div className="container mx-auto px-4 lg:px-12 max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Coleções em destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - Supreme */}
            <div
              className="relative overflow-hidden rounded-lg aspect-[16/10] w-full bg-[#D8E3F2] dark:bg-gray-800 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/assets/colecao-destaques/collection-1.png')" }}
            >
              <div className="relative z-10 p-3 flex flex-col justify-between h-full">
                <div>
                  <span className="inline-block bg-[#E0FF51] text-gray-900 text-xs font-extrabold px-3 py-1.5 rounded-md mb-4 uppercase tracking-wide">30% OFF</span>
                </div>
                <Link
                  to="/produtos?categoria=Camisetas"
                  className="bg-white/90 hover:bg-white text-[#EE4266] px-8 py-2.5 rounded-lg font-bold text-sm transition-all w-fit shadow-sm text-center"
                >
                  Comprar
                </Link>
              </div>
            </div>

            {/* Card 2 - Adidas */}
            <div
              className="relative overflow-hidden rounded-lg aspect-[16/10] w-full bg-[#E2E3FF] dark:bg-gray-800 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/assets/colecao-destaques/collection-2.png')" }}
            >
              <div className="relative z-10 p-3 flex flex-col justify-between h-full">
                <div>
                  <span className="inline-block bg-[#E0FF51] text-gray-900 text-xs font-extrabold px-3 py-1.5 rounded-md mb-4 uppercase tracking-wide">30% OFF</span>
                </div>
                <Link
                  to="/produtos?categoria=Tênis"
                  className="bg-white/90 hover:bg-white text-[#EE4266] px-8 py-2.5 rounded-lg font-bold text-sm transition-all w-fit shadow-sm text-center"
                >
                  Comprar
                </Link>
              </div>
            </div>

            {/* Card 3 - Beats */}
            <div
              className="relative overflow-hidden rounded-lg aspect-[16/10] w-full bg-[#F9F1E7] dark:bg-gray-800 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/assets/colecao-destaques/collection-3.png')" }}
            >
              <div className="relative z-10 p-3 flex flex-col justify-between h-full">
                <div>
                  <span className="inline-block bg-[#E0FF51] text-gray-900 text-xs font-extrabold px-3 py-1.5 rounded-md mb-4 uppercase tracking-wide">30% OFF</span>
                </div>
                <Link
                  to="/produtos?categoria=Headphones"
                  className="bg-white/90 hover:bg-white text-[#EE4266] px-8 py-2.5 rounded-lg font-bold text-sm transition-all w-fit shadow-sm text-center"
                >
                  Comprar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="py-12 bg-[#F9F8FE] dark:bg-gray-950">
        <div className="container mx-auto px-4 lg:px-12 text-center">
          <h3 className="text-xl font-bold text-[#474747] dark:text-gray-200 mb-12">Categorias em destaque</h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-14">
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
                <Link key={idx} to={`/produtos?categoria=${cat.name}`} className="group flex flex-col items-center gap-4 transition-all">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 shadow-[0_4px_25px_rgba(0,0,0,0.05)] dark:shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-2 border-2 border-transparent group-hover:border-primary dark:border-gray-700 dark:group-hover:border-primary">
                    <img src={iconSrc} alt={cat.name} className="w-12 h-12 object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 group-hover:brightness-125" />
                  </div>
                  <span className="text-sm font-bold text-[#474747] dark:text-gray-300 group-hover:text-primary transition-colors duration-300">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F9F8FE] dark:bg-gray-950">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Produtos em alta</h3>
            <Link to="/produtos" className="text-primary font-medium flex items-center gap-1 hover:underline">
              Ver todos <LucideIcons.ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-gray-900/30 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-12 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 relative flex justify-center min-h-[400px]">
            <div className={`w-full h-full transition-opacity duration-500 ${isModelTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <Sneaker3DView currentModel={currentModel} modelKey={currentModel.id} />
            </div>

            {/* Botões de navegação */}
            <button
              onClick={prevModel}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-700"
              aria-label="Modelo anterior"
            >
              <LucideIcons.ChevronLeft className="w-6 h-6 text-gray-700 dark:text-white" />
            </button>

            <button
              onClick={nextModel}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-700"
              aria-label="Próximo modelo"
            >
              <LucideIcons.ChevronRight className="w-6 h-6 text-gray-700 dark:text-white" />
            </button>

            {/* Indicadores de página */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {AVAILABLE_MODELS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToModel(index)}
                  className={`transition-all rounded-full ${index === currentModelIndex
                    ? 'w-8 h-2 bg-primary'
                    : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  aria-label={`Ir para modelo ${index + 1}`}
                />
              ))}
            </div>
          </div>
          <div className={`md:w-1/2 text-center md:text-left transition-opacity duration-500 ${isModelTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
              {currentModel.tag}
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white font-black leading-tight mb-4">
              {currentModel.name}
            </h2>
            <p className="text-2xl font-bold text-primary mb-6">
              {currentModel.price}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-base mb-8 leading-relaxed mx-auto md:mx-0 max-w-md">
              {currentModel.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/produtos"
                className="bg-primary hover:bg-primary-hover text-white px-10 py-3 rounded-lg font-bold text-sm transition-transform transform hover:scale-105 shadow-lg shadow-primary/30 inline-block"
              >
                Ver Coleção Completa
              </Link>
              <button className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary text-gray-700 dark:text-white px-10 py-3 rounded-lg font-bold text-sm transition-all hover:scale-105 inline-block">
                Saiba Mais
              </button>
            </div>

            {/* Contador de modelos */}
            <div className="mt-8 flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm justify-center md:justify-start">
              <span className="font-bold text-primary text-lg">{currentModelIndex + 1}</span>
              <span>/</span>
              <span>{AVAILABLE_MODELS.length}</span>
              <span className="ml-2">modelos disponíveis</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
