
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: string;
  image: string; // Imagem principal (capa)
  images?: string[]; // Galeria de imagens adicionais
  description?: string;
  availableSizes?: string[]; // Numerações disponíveis em estoque
  stock?: number; // Quantidade total em estoque
}

export interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  type: 'product' | 'shipping';
  isFreeShipping?: boolean;
  stackable: boolean; // Se acumula com descontos existentes
}

export interface Collection {
  id: number;
  title: string;
  image: string;
  discount: string;
  bgColor: string;
}

export interface HeroSlide {
  id: number;
  tag: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  bgColor: string;
  bgDark: string;
}

export interface CartItem {
  id: string; // ID único combinando produto + tamanho + cor
  productId: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  color: string;
  size: string;
  quantity: number;
}

export interface Customer {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  registeredAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export interface Order {
  id: number;
  customerId: number | string | null;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}
