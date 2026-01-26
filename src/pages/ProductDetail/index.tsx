import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, X, AlertCircle, ArrowRight, Send, MoreVertical, Edit2, Trash2, Flag, UserX, ThumbsUp, Upload, MessageCircle, Heart } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import ProductCard from '../../components/ProductCard';
import CartModal from '../../components/CartModal';

// Interface para comentários
interface Comment {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  avatarColor: string;
  isEdited?: boolean;
  likes: number;
  likedBy: string[];
  image?: string;
  replies?: Comment[];
  parentId?: number;
}

// Base de dados de comentários por produto
const productComments: Record<number, Comment[]> = {
  1: [
    {
      id: 1,
      author: 'Carlos Mendes',
      avatar: 'C',
      rating: 5,
      date: 'Há 1 dia',
      text: 'Melhor tênis que já comprei! Conforto excepcional para o dia todo.',
      avatarColor: 'from-blue-500 to-cyan-500',
      likes: 12,
      likedBy: [],
      replies: []
    },
    {
      id: 2,
      author: 'Fernanda Lima',
      avatar: 'F',
      rating: 5,
      date: 'Há 3 dias',
      text: 'Adorei! Produto de ótima qualidade e chegou antes do prazo.',
      avatarColor: 'from-pink-500 to-rose-500',
      likes: 8,
      likedBy: [],
      replies: []
    },
    {
      id: 3,
      author: 'Roberto Silva',
      avatar: 'R',
      rating: 4,
      date: 'Há 1 semana',
      text: 'Muito bom, mas achei um pouco apertado no início. Depois de alguns dias ficou perfeito!',
      avatarColor: 'from-green-500 to-emerald-500',
      likes: 5,
      likedBy: [],
      replies: []
    }
  ],
  2: [
    {
      id: 1,
      author: 'Maria Silva',
      avatar: 'M',
      rating: 5,
      date: 'Há 2 dias',
      text: 'Produto excelente! Qualidade impecável e chegou super rápido. Recomendo muito!',
      avatarColor: 'from-primary to-primary-hover',
      likes: 15,
      likedBy: [],
      replies: []
    },
    {
      id: 2,
      author: 'João Santos',
      avatar: 'J',
      rating: 4,
      date: 'Há 5 dias',
      text: 'Muito bom! Apenas achei que poderia ter mais opções de cores, mas no geral estou muito satisfeito.',
      avatarColor: 'from-accent-yellow to-yellow-400',
      likes: 7,
      likedBy: [],
      replies: []
    },
    {
      id: 3,
      author: 'Ana Costa',
      avatar: 'A',
      rating: 5,
      date: 'Há 1 semana',
      text: 'Superou minhas expectativas! O material é de primeira qualidade e o acabamento é perfeito.',
      avatarColor: 'from-purple-500 to-pink-500',
      likes: 10,
      likedBy: [],
      replies: []
    }
  ],
  3: [
    {
      id: 1,
      author: 'Pedro Oliveira',
      avatar: 'P',
      rating: 5,
      date: 'Há 2 dias',
      text: 'Excelente para corrida! Muito leve e confortável.',
      avatarColor: 'from-orange-500 to-red-500',
      likes: 9,
      likedBy: [],
      replies: []
    },
    {
      id: 2,
      author: 'Julia Martins',
      avatar: 'J',
      rating: 5,
      date: 'Há 4 dias',
      text: 'Amortecimento perfeito! Meus pés agradecem.',
      avatarColor: 'from-indigo-500 to-purple-500',
      likes: 6,
      likedBy: [],
      replies: []
    }
  ],
  4: [
    {
      id: 1,
      author: 'Ricardo Alves',
      avatar: 'R',
      rating: 4,
      date: 'Há 1 dia',
      text: 'Bom custo-benefício. O produto é exatamente como na descrição.',
      avatarColor: 'from-teal-500 to-blue-500',
      likes: 4,
      likedBy: [],
      replies: []
    },
    {
      id: 2,
      author: 'Beatriz Santos',
      avatar: 'B',
      rating: 5,
      date: 'Há 3 dias',
      text: 'Adorei a qualidade do material! Muito melhor do que esperava.',
      avatarColor: 'from-pink-500 to-purple-500',
      likes: 11,
      likedBy: [],
      replies: []
    }
  ]
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById, products } = useProducts();
  const { addItem } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const product = getProductById(Number(id));
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('Padrão');
  const [showToast, setShowToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [comments, setComments] = useState<Comment[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [reportedComments, setReportedComments] = useState<number[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportCustomReason, setReportCustomReason] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyRating, setReplyRating] = useState(5);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openReplyMenuId, setOpenReplyMenuId] = useState<number | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [editReplyRating, setEditReplyRating] = useState(5);

  // Carregar comentários do produto
  useEffect(() => {
    if (product) {
      const defaultComments = productComments[product.id] || [
        {
          id: 1,
          author: 'Cliente Satisfeito',
          avatar: 'C',
          rating: 5,
          date: 'Há alguns dias',
          text: 'Ótimo produto! Recomendo.',
          avatarColor: 'from-primary to-primary-hover',
          likes: 0,
          likedBy: [],
          replies: []
        }
      ];

      // Carregar avaliações do localStorage (vindas da página de pedidos)
      const savedReviews = JSON.parse(localStorage.getItem('productReviews') || '[]');
      const productReviews = savedReviews
        .filter((review: any) => review.productId === product.id)
        .map((review: any) => ({
          id: review.id,
          author: review.author,
          avatar: review.avatar,
          rating: review.rating,
          date: review.date,
          text: review.text,
          avatarColor: review.avatarColor,
          likes: review.likes || 0,
          likedBy: review.likedBy || [],
          replies: review.replies || []
        }));

      // Combinar avaliações salvas com as padrão (avaliações salvas primeiro)
      setComments([...productReviews, ...defaultComments]);
    }
  }, [product]);

  // Mapeamento de tamanhos por categoria para exibição
  const getSizesByProductCategory = (category: string) => {
    switch (category) {
      case 'Tênis':
        return ['37', '38', '39', '40', '41', '42', '43'];
      case 'Camisetas':
      case 'Calças':
      case 'Blusas':
        return ['P', 'M', 'G', 'GG', 'XG'];
      case 'Headphones':
      case 'Bonés':
        return ['Único'];
      default:
        return ['P', 'M', 'G', 'GG'];
    }
  };

  const currentSizeSet = useMemo(() => {
    if (!product) return [];
    return getSizesByProductCategory(product.category);
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center bg-[#F9F8FE] dark:bg-gray-950 min-h-screen">
        <h2 className="text-2xl font-bold">Produto não encontrado</h2>
        <Link to="/produtos" className="text-primary hover:underline mt-4 inline-block">Voltar para a loja</Link>
      </div>
    );
  }

  const gallery = [product.image, ...(product.images || [])];
  const uniqueGallery = Array.from(new Set(gallery));

  const isSizeAvailable = (size: string) => {
    if (!product.availableSizes) return true;
    return product.availableSizes.includes(size);
  };

  const handleSizeClick = (size: string) => {
    if (!isSizeAvailable(size)) {
      setShowToast({ message: 'Tamanho sem estoque no momento.', type: 'error' });
      return;
    }
    setSelectedSize(size);
  };

  const handleBuy = () => {
    if (!selectedSize) {
      setShowToast({ message: 'Por favor, selecione um tamanho disponível.', type: 'error' });
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      color: selectedColor,
      size: selectedSize,
      quantity: 1
    });
    setShowCartModal(true);
  };

  const handleToggleFavorite = () => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
      setShowToast({ message: 'Removido dos favoritos', type: 'success' });
    } else {
      addFavorite(product);
      setShowToast({ message: 'Adicionado aos favoritos', type: 'success' });
    }
  };

  const handleSubmitComment = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      setShowToast({ message: 'Por favor, escreva seu comentário.', type: 'error' });
      return;
    }

    const comment: Comment = {
      id: comments.length + 1,
      author: user?.name || 'Você',
      avatar: user?.name?.charAt(0).toUpperCase() || 'V',
      rating: newRating,
      date: 'Agora',
      text: newComment,
      avatarColor: 'from-primary to-primary-hover',
      likes: 0,
      likedBy: [],
      image: imagePreview || undefined,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
    setNewRating(5);
    handleRemoveImage();
    setShowToast({ message: 'Comentário adicionado com sucesso!', type: 'success' });
  };

  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter(c => c.id !== commentId));
    setOpenMenuId(null);
    setShowToast({ message: 'Comentário removido.', type: 'success' });
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
    setEditRating(comment.rating);
    setOpenMenuId(null);
  };

  const handleSaveEdit = (commentId: number) => {
    if (!editText.trim()) {
      setShowToast({ message: 'O comentário não pode estar vazio.', type: 'error' });
      return;
    }

    setComments(comments.map(c =>
      c.id === commentId
        ? { ...c, text: editText, rating: editRating, isEdited: true }
        : c
    ));
    setEditingCommentId(null);
    setShowToast({ message: 'Comentário editado com sucesso!', type: 'success' });
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
    setEditRating(5);
  };

  const handleBlockUser = (author: string) => {
    setBlockedUsers([...blockedUsers, author]);
    setOpenMenuId(null);
    setShowToast({ message: `Comentários de ${author} foram bloqueados.`, type: 'success' });
  };

  const handleReportComment = (commentId: number) => {
    setReportingCommentId(commentId);
    setShowReportModal(true);
    setOpenMenuId(null);
  };

  const handleSubmitReport = () => {
    if (!reportReason) {
      setShowToast({ message: 'Por favor, selecione um motivo.', type: 'error' });
      return;
    }

    if (reportReason === 'Outro' && !reportCustomReason.trim()) {
      setShowToast({ message: 'Por favor, especifique o motivo.', type: 'error' });
      return;
    }

    if (reportingCommentId) {
      setReportedComments([...reportedComments, reportingCommentId]);
      setShowToast({ message: 'Comentário denunciado. Obrigado pelo feedback.', type: 'success' });
    }

    setShowReportModal(false);
    setReportingCommentId(null);
    setReportReason('');
    setReportCustomReason('');
  };

  const handleLikeComment = (commentId: number) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const userId = user?.id || 'guest';
    setComments(comments.map(c => {
      if (c.id === commentId) {
        const hasLiked = c.likedBy.includes(userId);
        return {
          ...c,
          likes: hasLiked ? c.likes - 1 : c.likes + 1,
          likedBy: hasLiked
            ? c.likedBy.filter(id => id !== userId)
            : [...c.likedBy, userId]
        };
      }
      return c;
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setShowToast({ message: 'Por favor, selecione apenas imagens.', type: 'error' });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setShowToast({ message: 'A imagem deve ter no máximo 5MB.', type: 'error' });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartReply = (commentId: number) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setReplyingToId(commentId);
    setOpenMenuId(null);
  };

  const handleCancelReply = () => {
    setReplyingToId(null);
    setReplyText('');
    setReplyRating(5);
  };

  const handleSubmitReply = (parentId: number) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!replyText.trim()) {
      setShowToast({ message: 'Por favor, escreva sua resposta.', type: 'error' });
      return;
    }

    const reply: Comment = {
      id: Date.now(),
      author: user?.name || 'Você',
      avatar: user?.name?.charAt(0).toUpperCase() || 'V',
      rating: replyRating,
      date: 'Agora',
      text: replyText,
      avatarColor: 'from-primary to-primary-hover',
      likes: 0,
      likedBy: [],
      parentId: parentId
    };

    setComments(comments.map(c => {
      if (c.id === parentId) {
        return {
          ...c,
          replies: [...(c.replies || []), reply]
        };
      }
      return c;
    }));

    setReplyingToId(null);
    setReplyText('');
    setReplyRating(5);
    setShowToast({ message: 'Resposta adicionada!', type: 'success' });
  };

  const handleStartEditReply = (reply: Comment, parentId: number) => {
    setEditingReplyId(reply.id);
    setEditReplyText(reply.text);
    setEditReplyRating(reply.rating);
    setOpenReplyMenuId(null);
  };

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditReplyText('');
    setEditReplyRating(5);
  };

  const handleSaveEditReply = (parentId: number, replyId: number) => {
    if (!editReplyText.trim()) {
      setShowToast({ message: 'O texto da resposta não pode estar vazio.', type: 'error' });
      return;
    }

    setComments(comments.map(c => {
      if (c.id === parentId && c.replies) {
        return {
          ...c,
          replies: c.replies.map(r =>
            r.id === replyId
              ? { ...r, text: editReplyText, rating: editReplyRating, isEdited: true }
              : r
          )
        };
      }
      return c;
    }));

    setEditingReplyId(null);
    setEditReplyText('');
    setEditReplyRating(5);
    setShowToast({ message: 'Resposta editada com sucesso!', type: 'success' });
  };

  const handleDeleteReply = (parentId: number, replyId: number) => {
    setComments(comments.map(c => {
      if (c.id === parentId && c.replies) {
        return {
          ...c,
          replies: c.replies.filter(r => r.id !== replyId)
        };
      }
      return c;
    }));
    setOpenReplyMenuId(null);
    setShowToast({ message: 'Resposta removida.', type: 'success' });
  };

  const handleReportReply = (parentId: number, replyId: number) => {
    // Marcar a resposta como denunciada (apenas visualmente para o usuário)
    setReportedComments([...reportedComments, replyId]);
    setOpenReplyMenuId(null);
    setShowToast({ message: 'Resposta denunciada com sucesso.', type: 'success' });
  };

  const handleBlockReplyAuthor = (author: string) => {
    setBlockedUsers([...blockedUsers, author]);
    setOpenReplyMenuId(null);
    setShowToast({ message: `Comentários de ${author} foram bloqueados.`, type: 'success' });
  };


  const filteredComments = comments.filter(c =>
    !blockedUsers.includes(c.author) && !reportedComments.includes(c.id)
  );

  // Ordenação inteligente: comentário do usuário primeiro (apenas para ele), depois por likes
  const sortedComments = useMemo(() => {
    const userComment = filteredComments.find(c => c.author === user?.name || c.author === 'Você');
    const otherComments = filteredComments
      .filter(c => c.author !== user?.name && c.author !== 'Você')
      .sort((a, b) => b.likes - a.likes);

    return userComment ? [userComment, ...otherComments] : otherComments;
  }, [filteredComments, user]);

  return (
    <div className="min-h-screen bg-[#F9F8FE] dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 py-8 lg:px-12 relative">
        {/* Toast Animado */}
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'}`}>
          <div className={`bg-white dark:bg-gray-800 border-l-4 shadow-2xl rounded-xl py-4 px-6 flex items-center gap-4 min-w-[320px] ${showToast?.type === 'error' ? 'border-red-500' : 'border-primary'}`}>
            <div className={`p-2 rounded-full ${showToast?.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
              {showToast?.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            </div>
            <div className="flex-grow">
              <p className="font-bold text-gray-800 dark:text-white text-sm">{showToast?.message}</p>
            </div>
            <button onClick={() => setShowToast(null)} className="text-gray-300 hover:text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/produtos" className="hover:text-primary transition-colors">Produtos</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-200 font-medium">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          <div className="lg:w-7/12 space-y-4">
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl aspect-[4/3] flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm z-10">
              {product.discount && (
                <span className="absolute top-6 left-6 bg-accent-yellow text-gray-800 text-[10px] font-black px-4 py-1.5 rounded-full z-10 shadow-lg">
                  {product.discount}
                </span>
              )}
              <img
                alt={product.name}
                className="object-contain w-3/4 mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-500 ease-out"
                src={uniqueGallery[activeImageIndex]}
              />
            </div>

            <div className="grid grid-cols-5 gap-4">
              {uniqueGallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`aspect-square bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center p-2 border-2 transition-all ${activeImageIndex === i ? 'border-primary ring-4 ring-primary/10' : 'border-gray-50 dark:border-gray-700 hover:border-primary/50 opacity-60 hover:opacity-100'}`}
                >
                  <img alt={`Thumbnail ${i}`} className="object-cover object-center w-full h-full mix-blend-multiply dark:mix-blend-normal" src={img} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-5/12 space-y-8 z-10">
            <div>
              <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-2 leading-tight tracking-tight">{product.name}</h1>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">{product.category}</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">(PRODUTO EM ALTA)</span>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex flex-col">
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through font-medium">R$ {product.originalPrice},00</span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-gray-400 font-bold mb-1">R$</span>
                  <span className="text-6xl font-black text-gray-800 dark:text-white tracking-tighter leading-none">{product.price}</span>
                  <span className="text-xl font-bold text-gray-800 dark:text-white">,00</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-bold text-gray-400 mb-4 text-[10px] uppercase tracking-[0.2em]">Descrição</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium">
                {product.description || "Este item premium foi selecionado pela Digital Store pela sua qualidade excepcional e design vanguardista."}
              </p>
            </div>

            {currentSizeSet.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-400 mb-4 text-[10px] uppercase tracking-[0.2em]">Tamanho</h3>
                <div className="flex flex-wrap gap-3">
                  {currentSizeSet.map(size => {
                    const available = isSizeAvailable(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeClick(size)}
                        className={`relative min-w-[56px] h-14 px-4 rounded-2xl border-2 flex items-center justify-center text-sm transition-all font-black overflow-hidden
                          ${!available ? 'opacity-30 border-gray-100 cursor-not-allowed bg-gray-50 grayscale' :
                            selectedSize === size ? 'bg-primary text-white border-primary shadow-xl shadow-primary/30 scale-110 z-10' :
                              'border-gray-100 dark:border-gray-800 dark:text-gray-400 hover:border-primary/30 hover:text-primary bg-white dark:bg-gray-900'}
                        `}
                      >
                        {size}
                        {!available && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-px bg-gray-400 -rotate-45 absolute opacity-40"></div>
                            <div className="w-full h-px bg-gray-400 rotate-45 absolute opacity-40"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-6 flex gap-4">
              <button
                onClick={handleBuy}
                disabled={!selectedSize}
                className={`flex-1 font-black py-6 rounded-3xl uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-4
                  ${selectedSize ? 'bg-primary hover:bg-primary-hover text-white shadow-2xl shadow-primary/30 active:scale-[0.96]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
              >
                {selectedSize ? 'Comprar Agora' : 'Selecione um tamanho'}
              </button>

              <button
                onClick={handleToggleFavorite}
                title={isFavorite(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                aria-label={isFavorite(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                className={`px-6 py-6 rounded-3xl font-black transition-all flex items-center justify-center gap-2
                  ${isFavorite(product.id)
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 active:scale-[0.96]'
                    : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 active:scale-[0.96]'}
                `}
              >
                <Heart
                  size={24}
                  className={isFavorite(product.id) ? 'fill-current' : ''}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modal de confirmação de adição ao carrinho */}
        <CartModal
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          onGoToCart={() => navigate('/carrinho')}
        />

        {/* Seção de Comentários */}
        <section className="mt-12 sm:mt-20 border-t border-gray-100 dark:border-gray-800 pt-8 sm:pt-16 mb-12 sm:mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden" style={{ minHeight: '30vh' }}>
          <div className="mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter mb-2 break-words">Comentários</h3>
            <p className="text-gray-400 text-xs sm:text-sm font-medium">O que nossos clientes estão dizendo sobre este produto</p>
          </div>

          {/* Formulário para adicionar comentário */}
          <div className="mb-8 bg-transparent backdrop-blur-sm p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}>
            {!isLoggedIn && (
              <div className="mb-4 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  <strong>Faça login</strong> para comentar e interagir com outros usuários.
                </p>
              </div>
            )}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-black text-base sm:text-lg flex-shrink-0">
                {isLoggedIn ? (user?.name?.charAt(0).toUpperCase() || 'U') : '?'}
              </div>
              <div className="flex-grow space-y-3">
                {/* Seletor de avaliação */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Sua Avaliação:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => {
                          if (!isLoggedIn) {
                            navigate('/login');
                            return;
                          }
                          setNewRating(star);
                        }}
                        className="transition-colors disabled:opacity-50"
                        disabled={!isLoggedIn}
                      >
                        <Star
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= newRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input de comentário */}
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onClick={() => {
                        if (!isLoggedIn) {
                          navigate('/login');
                        }
                      }}
                      placeholder={isLoggedIn ? "Compartilhe sua experiência com este produto..." : "Faça login para comentar..."}
                      className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-3 sm:p-4 pr-12 sm:pr-14 text-xs sm:text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:border-primary focus:outline-none transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      rows={3}
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}
                      disabled={!isLoggedIn}
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!isLoggedIn}
                      title="Enviar comentário"
                      aria-label="Enviar comentário sobre o produto"
                      className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 bg-primary hover:bg-primary-hover text-white p-2 sm:p-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Upload de imagem e Preview */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={!isLoggedIn}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!isLoggedIn}
                      title="Adicionar foto ao comentário"
                      aria-label="Fazer upload de imagem para anexar ao comentário"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                      <span>Adicionar foto</span>
                    </button>

                    {imagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
                        />
                        <button
                          onClick={handleRemoveImage}
                          title="Remover imagem"
                          aria-label="Remover imagem do comentário"
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de comentários */}
          <div className="space-y-4 sm:space-y-6 max-h-[35vh] sm:max-h-[28vh] overflow-y-auto overflow-x-hidden pr-2 sm:pr-4 custom-scrollbar">
            {sortedComments.map(comment => (
              <div key={comment.id} className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex items-start gap-3 sm:gap-4 w-full">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${comment.avatarColor} flex items-center justify-center text-white font-black text-base sm:text-lg flex-shrink-0`}>
                    {comment.avatar}
                  </div>
                  <div className="flex-grow min-w-0 w-full overflow-hidden">
                    <div className="flex items-start sm:items-center justify-between mb-2 gap-2 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1 overflow-hidden">
                        <h4 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white truncate max-w-full">{comment.author}</h4>
                        {comment.isEdited && (
                          <span className="text-[9px] sm:text-[10px] text-gray-400 italic whitespace-nowrap flex-shrink-0">(Editado)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">{comment.date}</span>

                        {/* Menu de três pontos */}
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                            title="Opções do comentário"
                            aria-label="Menu de opções para o comentário"
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                          >
                            <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" aria-hidden="true" />
                          </button>

                          {openMenuId === comment.id && (
                            <>
                              {/* Overlay para fechar o menu ao clicar fora */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />

                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
                                {(comment.author === user?.name || comment.author === 'Você') ? (
                                  <>
                                    {/* Opções para o próprio comentário */}
                                    <button
                                      onClick={() => handleStartEdit(comment)}
                                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                    >
                                      <Edit2 className="w-4 h-4 text-blue-500" />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Editar</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Remover</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {/* Opções para comentários de outros usuários */}
                                    <button
                                      onClick={() => handleStartReply(comment.id)}
                                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                    >
                                      <MessageCircle className="w-4 h-4 text-blue-500" />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Responder</span>
                                    </button>
                                    <button
                                      onClick={() => handleReportComment(comment.id)}
                                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
                                    >
                                      <Flag className="w-4 h-4 text-orange-500" />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Denunciar</span>
                                    </button>
                                    <button
                                      onClick={() => handleBlockUser(comment.author)}
                                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
                                    >
                                      <UserX className="w-4 h-4 text-red-500" />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Bloquear</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Modo de edição */}
                    {editingCommentId === comment.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avaliação:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => setEditRating(star)}
                                title={`Classificar com ${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                                aria-label={`Classificar com ${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                                className="transition-colors"
                              >
                                <Star
                                  className={`w-4 h-4 ${star <= editRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                                  aria-hidden="true"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-800 dark:text-white focus:border-primary focus:outline-none transition-colors resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(comment.id)}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all active:scale-95"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl transition-all active:scale-95"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex text-yellow-500 mb-3">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < comment.rating ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 break-words overflow-wrap-anywhere">
                          {comment.text}
                        </p>

                        {/* Exibir imagem do comentário */}
                        {comment.image && (
                          <div className="mb-3">
                            <img
                              src={comment.image}
                              alt="Foto do produto"
                              className="max-w-full sm:max-w-xs h-auto rounded-xl border-2 border-gray-200 dark:border-gray-700 object-cover"
                            />
                          </div>
                        )}

                        {/* Interface de resposta */}
                        {replyingToId === comment.id && (
                          <div className="mb-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-bold text-gray-400">Respondendo a {comment.author}:</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    onClick={() => setReplyRating(star)}
                                    className="transition-colors"
                                  >
                                    <Star className={`w-3.5 h-3.5 ${star <= replyRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Escreva sua resposta..."
                              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-xs sm:text-sm resize-none focus:border-primary focus:outline-none mb-2"
                              rows={2}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={handleCancelReply}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                                title="Enviar resposta"
                                aria-label="Enviar resposta ao comentário"
                                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all"
                              >
                                Responder
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Exibir respostas */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 ml-4 sm:ml-6 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-3 sm:pl-4">
                            {comment.replies
                              .filter(reply => !blockedUsers.includes(reply.author) && !reportedComments.includes(reply.id))
                              .map(reply => (
                                <div key={reply.id} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl relative">
                                  <div className="flex items-start gap-2">
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${reply.avatarColor} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                                      {reply.avatar}
                                    </div>
                                    <div className="flex-grow min-w-0 w-full">
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <h5 className="font-bold text-xs text-gray-800 dark:text-white truncate">{reply.author}</h5>
                                          {reply.isEdited && (
                                            <span className="text-[9px] text-gray-400 italic whitespace-nowrap">(Editado)</span>
                                          )}
                                          <span className="text-[10px] text-gray-400 whitespace-nowrap">{reply.date}</span>
                                        </div>

                                        {/* Menu de três pontos para resposta */}
                                        <div className="relative flex-shrink-0">
                                          <button
                                            onClick={() => setOpenReplyMenuId(openReplyMenuId === reply.id ? null : reply.id)}
                                            title="Opções da resposta"
                                            aria-label="Menu de opções para a resposta"
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                          >
                                            <MoreVertical className="w-3 h-3 text-gray-400" aria-hidden="true" />
                                          </button>

                                          {openReplyMenuId === reply.id && (
                                            <>
                                              <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setOpenReplyMenuId(null)}
                                              />
                                              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
                                                {(reply.author === user?.name || reply.author === 'Você') ? (
                                                  <>
                                                    <button
                                                      onClick={() => handleStartEditReply(reply, comment.id)}
                                                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                                    >
                                                      <Edit2 className="w-3 h-3 text-blue-500" />
                                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Editar</span>
                                                    </button>
                                                    <button
                                                      onClick={() => handleDeleteReply(comment.id, reply.id)}
                                                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
                                                    >
                                                      <Trash2 className="w-3 h-3 text-red-500" />
                                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Remover</span>
                                                    </button>
                                                  </>
                                                ) : (
                                                  <>
                                                    <button
                                                      onClick={() => handleReportReply(comment.id, reply.id)}
                                                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                                    >
                                                      <Flag className="w-3 h-3 text-orange-500" />
                                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Denunciar</span>
                                                    </button>
                                                    <button
                                                      onClick={() => handleBlockReplyAuthor(reply.author)}
                                                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
                                                    >
                                                      <UserX className="w-3 h-3 text-red-500" />
                                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Bloquear</span>
                                                    </button>
                                                  </>
                                                )}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      {editingReplyId === reply.id ? (
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-400">Avaliação:</span>
                                            <div className="flex gap-0.5">
                                              {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                  key={star}
                                                  onClick={() => setEditReplyRating(star)}
                                                  title={`Classificar com ${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                                                  aria-label={`Classificar resposta com ${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                                                  className="transition-colors"
                                                >
                                                  <Star
                                                    className={`w-3 h-3 ${star <= editReplyRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                                                    aria-hidden="true"
                                                  />
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                          <textarea
                                            value={editReplyText}
                                            onChange={(e) => setEditReplyText(e.target.value)}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-xs resize-none focus:border-primary focus:outline-none"
                                            rows={2}
                                          />
                                          <div className="flex gap-2 justify-end">
                                            <button
                                              onClick={handleCancelEditReply}
                                              className="px-2 py-1 text-[10px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                              Cancelar
                                            </button>
                                            <button
                                              onClick={() => handleSaveEditReply(comment.id, reply.id)}
                                              className="px-2 py-1 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded transition-all"
                                            >
                                              Salvar
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex text-yellow-500 mb-2">
                                            {Array.from({ length: 5 }, (_, i) => (
                                              <Star
                                                key={i}
                                                className={`w-2.5 h-2.5 ${i < reply.rating ? 'fill-current' : ''}`}
                                              />
                                            ))}
                                          </div>
                                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed break-words">
                                            {reply.text}
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Botão de Like */}
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          title={comment.likedBy.includes(user?.id || '') ? "Remover curtida" : "Curtir comentário"}
                          aria-label={comment.likedBy.includes(user?.id || '') ? `Você e mais ${comment.likes - 1} pessoas curtiram este comentário` : `Curtir este comentário. ${comment.likes} pessoas já curtiram`}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${isLoggedIn && comment.likedBy.includes(user?.id || '')
                            ? 'bg-primary/10 text-primary'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                          <ThumbsUp
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoggedIn && comment.likedBy.includes(user?.id || '') ? 'fill-current' : ''
                              }`}
                            aria-hidden="true"
                          />
                          <span className="text-xs sm:text-sm font-bold">{comment.likes}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modal de Denúncia */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl w-full max-w-md p-5 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-2xl font-black text-gray-800 dark:text-white">Denunciar Comentário</h3>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                    setReportCustomReason('');
                  }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Selecione o motivo da denúncia:
              </p>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {[
                  { value: 'assedio', label: 'Por assédio' },
                  { value: 'abuso', label: 'Por abuso' },
                  { value: 'spam', label: 'Por spam' },
                  { value: 'preconceito', label: 'Por preconceito' },
                  { value: 'Outro', label: 'Outro' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={option.value}
                      checked={reportReason === option.value}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary focus:ring-primary flex-shrink-0"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>

              {reportReason === 'Outro' && (
                <div className="mb-4 sm:mb-6">
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Especifique o motivo (máx. 300 caracteres):
                  </label>
                  <textarea
                    value={reportCustomReason}
                    onChange={(e) => setReportCustomReason(e.target.value.slice(0, 300))}
                    placeholder="Descreva o motivo da denúncia..."
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:border-primary focus:outline-none transition-colors resize-none"
                    rows={3}
                  />
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 text-right">
                    {reportCustomReason.length}/300
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmitReport}
                className="w-full bg-primary hover:bg-primary-hover text-white font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl uppercase tracking-wider text-xs sm:text-sm transition-all active:scale-95 shadow-lg shadow-primary/30"
              >
                Enviar Denúncia
              </button>
            </div>
          </div>
        )}
        {/* Seção de Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-16 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Produtos Relacionados</h3>
                <p className="text-gray-400 text-sm font-medium">Itens da categoria {product.category} que você também pode gostar.</p>
              </div>
              <Link
                to={`/produtos?categoria=${product.category}`}
                className="text-primary font-bold text-sm hover:translate-x-1 transition-transform flex items-center gap-2 group"
              >
                Ver tudo nesta categoria
                <ArrowRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                <div key={p.id} className="hover:-translate-y-2 transition-transform duration-300">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
