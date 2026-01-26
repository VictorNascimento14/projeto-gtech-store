
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Coupon, HeroSlide, Customer, Order } from '../types';
import { supabase } from '../lib/supabase';
import { INITIAL_PRODUCTS } from '../constants';

interface ProductContextType {
  products: Product[];
  coupons: Coupon[];
  heroSlides: HeroSlide[];
  customers: Customer[];
  orders: Order[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (id: number) => Promise<void>;
  getProductById: (id: number) => Product | undefined;
  addHeroSlide: (slide: HeroSlide) => Promise<void>;
  updateHeroSlide: (slide: HeroSlide) => Promise<void>;
  deleteHeroSlide: (id: number) => Promise<void>;
  updateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: 'Melhores ofertas personalizadas',
    title: 'Queima de stoque Nike 🔥',
    description: 'Consequat culpa exercitation mollit nisi excepteur do do tempor laboris eiusmod irure consectetur.',
    buttonText: 'Ver Ofertas',
    buttonLink: '/produtos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrPlN5J3q2tsm7xm5e8eDdL_DkVtbmB6yR6VuTr2tANhXyZLdX1mim9RtryWY2lUmfMVU27oS51yF983BT69sgAZUR3MhgCZKBsB3xRsmnkAXQnGVasWnY-Gec02NiJ4lkcFwVL8nGrRk8PffbhMIOW3ges4GZPjRIH04sjefT5Bml3hgkYChyixCQb_oNSXDOp0iTLL--f0SJW2yKl3EIMED1f9re_SNsd9PePFiEG3lABSMroLLPPga_9oY40TMEBWuGncSXx3c',
    bgColor: 'bg-[#F5F5F5]',
    bgDark: 'dark:bg-gray-900/50'
  },
  {
    id: 2,
    tag: 'Tendências 2025',
    title: 'O estilo que você domina 👟',
    description: 'Descubra a coleção que está redefinindo o streetwear. Conforto incomparável e a exclusividade que o seu corre merece.',
    buttonText: 'Aproveitar Ofertas',
    buttonLink: '/produtos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrPlN5J3q2tsm7xm5e8eDdL_DkVtbmB6yR6VuTr2tANhXyZLdX1mim9RtryWY2lUmfMVU27oS51yF983BT69sgAZUR3MhgCZKBsB3xRsmnkAXQnGVasWnY-Gec02NiJ4lkcFwVL8nGrRk8PffbhMIOW3ges4GZPjRIH04sjefT5Bml3hgkYChyixCQb_oNSXDOp0iTLL--f0SJW2yKl3EIMED1f9re_SNsd9PePFiEG3lABSMroLLPPga_9oY40TMEBWuGncSXx3c',
    bgColor: 'bg-[#F5F5F5]',
    bgDark: 'dark:bg-gray-900/50'
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Seed if empty
      if (!productsData || productsData.length === 0) {
        for (const product of INITIAL_PRODUCTS) {
          await supabase.from('products').insert({
            name: product.name,
            category: product.category,
            price: product.price,
            original_price: product.originalPrice,
            image: product.image,
            images: product.images || [],
            discount: product.discount,
            description: product.description,
            available_sizes: product.availableSizes || [],
            stock: product.stock || 0
          });
        }
        const { data: reloadedProducts } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        setProducts(mapProductsFromDB(reloadedProducts || []));
      } else {
        setProducts(mapProductsFromDB(productsData));
      }

      // Load coupons
      const { data: couponsData } = await supabase.from('coupons').select('*').eq('active', true);
      setCoupons(mapCouponsFromDB(couponsData || []));

      // Load hero slides
      const { data: slidesData } = await supabase.from('hero_slides').select('*').eq('active', true).order('position', { ascending: true });
      if (!slidesData || slidesData.length === 0) {
        for (const slide of INITIAL_HERO_SLIDES) {
          await supabase.from('hero_slides').insert({
            tag: slide.tag, title: slide.title, description: slide.description,
            button_text: slide.buttonText, button_link: slide.buttonLink,
            image: slide.image, bg_color: slide.bgColor, bg_dark: slide.bgDark, position: slide.id
          });
        }
        const { data: rs } = await supabase.from('hero_slides').select('*').eq('active', true).order('position', { ascending: true });
        setHeroSlides(mapHeroSlidesFromDB(rs || []));
      } else {
        setHeroSlides(mapHeroSlidesFromDB(slidesData));
      }

      // Load orders with items
      const { data: ordersData } = await supabase.from('orders').select('*, order_items (*)').order('created_at', { ascending: false });
      const mappedOrders = mapOrdersFromDB(ordersData || []);
      setOrders(mappedOrders);

      // Load customers
      const { data: usersData } = await supabase.rpc('get_users_for_admin');
      if (usersData) {
        const mappedCustomers = usersData.map((user: any) => {
          const userOrders = mappedOrders.filter(o => o.customerEmail === user.email);
          const totalSpent = userOrders.reduce((acc, curr) => acc + curr.total, 0);
          return {
            id: user.id,
            name: user.raw_user_meta_data?.name || user.email.split('@')[0],
            email: user.email,
            registeredAt: new Date(user.created_at).toLocaleDateString(),
            totalOrders: userOrders.length,
            totalSpent: totalSpent,
            status: 'active'
          };
        });
        setCustomers(mappedCustomers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const sub = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, () => loadData())
      .subscribe();

    return () => { sub.unsubscribe(); };
  }, []);

  // Mapping functions
  const mapProductsFromDB = (data: any[]): Product[] => {
    return data.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: parseFloat(p.price),
      originalPrice: parseFloat(p.original_price),
      discount: p.discount || '',
      image: p.image,
      images: p.images || [],
      description: p.description,
      availableSizes: p.available_sizes || [],
      stock: p.stock || 0
    }));
  };

  const mapCouponsFromDB = (data: any[]): Coupon[] => {
    return data.map(c => ({
      id: c.id,
      code: c.code,
      discountPercent: parseFloat(c.discount_percent),
      type: c.type,
      isFreeShipping: c.is_free_shipping,
      stackable: c.stackable
    }));
  };

  const mapHeroSlidesFromDB = (data: any[]): HeroSlide[] => {
    return data.map(s => ({
      id: s.id,
      tag: s.tag || '',
      title: s.title,
      description: s.description || '',
      buttonText: s.button_text,
      buttonLink: s.button_link,
      image: s.image,
      bgColor: s.bg_color,
      bgDark: s.bg_dark
    }));
  };

  const mapOrdersFromDB = (data: any[]): Order[] => {
    return data.map(o => ({
      id: o.id,
      customerId: o.user_id || 0,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      items: (o.order_items || []).map((item: any) => ({
        id: `${item.product_id}-${item.size}-${item.color}`,
        productId: item.product_id,
        name: item.name,
        image: item.image,
        price: parseFloat(item.price),
        originalPrice: parseFloat(item.price),
        color: item.color || 'Padrão',
        size: item.size || 'Único',
        quantity: item.quantity
      })),
      total: parseFloat(o.total),
      status: o.status,
      paymentMethod: o.payment_method,
      shippingAddress: o.shipping_address,
      createdAt: o.created_at,
      updatedAt: o.updated_at
    }));
  };

  // CRUD operations
  const addProduct = async (product: Product) => {
    const { error } = await supabase.from('products').insert({
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice,
      image: product.image,
      images: product.images || [],
      discount: product.discount,
      description: product.description,
      available_sizes: product.availableSizes || [],
      stock: product.stock || 0
    });

    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }

    await loadData();
  };

  const updateProduct = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({
        name: product.name,
        category: product.category,
        price: product.price,
        original_price: product.originalPrice,
        image: product.image,
        images: product.images || [],
        discount: product.discount,
        description: product.description,
        available_sizes: product.availableSizes || [],
        stock: product.stock || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', product.id);

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    await loadData();
  };

  const deleteProduct = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }

    await loadData();
  };

  const addCoupon = async (coupon: Coupon) => {
    const { error } = await supabase.from('coupons').insert({
      code: coupon.code,
      discount_percent: coupon.discountPercent,
      type: coupon.type,
      is_free_shipping: coupon.isFreeShipping,
      stackable: coupon.stackable,
      active: true
    });

    if (error) {
      console.error('Error adding coupon:', error);
      throw error;
    }

    await loadData();
  };

  const deleteCoupon = async (id: number) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);

    if (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }

    await loadData();
  };

  const getProductById = (id: number) => {
    return products.find(p => p.id === id);
  };

  const addHeroSlide = async (slide: HeroSlide) => {
    const { error } = await supabase.from('hero_slides').insert({
      tag: slide.tag,
      title: slide.title,
      description: slide.description,
      button_text: slide.buttonText,
      button_link: slide.buttonLink,
      image: slide.image,
      bg_color: slide.bgColor,
      bg_dark: slide.bgDark,
      position: heroSlides.length
    });

    if (error) {
      console.error('Error adding hero slide:', error);
      throw error;
    }

    await loadData();
  };

  const updateHeroSlide = async (slide: HeroSlide) => {
    const { error } = await supabase
      .from('hero_slides')
      .update({
        tag: slide.tag,
        title: slide.title,
        description: slide.description,
        button_text: slide.buttonText,
        button_link: slide.buttonLink,
        image: slide.image,
        bg_color: slide.bgColor,
        bg_dark: slide.bgDark
      })
      .eq('id', slide.id);

    if (error) {
      console.error('Error updating hero slide:', error);
      throw error;
    }
    await loadData();
  };

  const deleteHeroSlide = async (id: number) => {
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);

    if (error) {
      console.error('Error deleting hero slide:', error);
      throw error;
    }

    await loadData();
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }

    await loadData();
  };

  const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Calculate subtotal
      const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      // 1. Create the order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: order.customerId,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          total: order.total,
          subtotal: subtotal,
          status: order.status,
          payment_method: order.paymentMethod,
          shipping_address: order.shippingAddress,
          shipping_cost: 0, // Defaulting to 0 if not tracked
          discount: 0      // Defaulting to 0 if not tracked
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Failed to create order');

      // 2. Create order items items
      const orderItems = order.items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        name: item.name,
        image: item.image
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Force reload to update UI immediately
      await loadData();

    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      coupons,
      heroSlides,
      customers,
      orders,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      addCoupon,
      deleteCoupon,
      getProductById,
      addHeroSlide,
      updateHeroSlide,
      deleteHeroSlide,
      updateOrderStatus,
      createOrder
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};
