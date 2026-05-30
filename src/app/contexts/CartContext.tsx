import { createContext, useContext, useEffect, ReactNode, useState } from 'react';

export type WorkshopItem = {
  type: 'workshop';
  id: string;
  name: string;
  date: string;
  time: string;
  instructor: string;
  price: number;
  tickets: number;
  package: string;
  reservedUntil: number;
};

export type ProductItem = {
  type: 'product';
  id: string;
  name: string;
  price: number;
  quantity: number;
  stockQty?: number;
  image: string;
};

export type CartItem = WorkshopItem | ProductItem;

export type CheckoutAddress = {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  ward: string;
  address: string;
  note: string;
  shipping: string;
};

export type OrderData = {
  orderCode: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  customer: CheckoutAddress;
  createdAt: string;
  paymentMethod: 'momo' | 'vnpay';
};

type CartContextType = {
  items: CartItem[];
  orderData: OrderData | null;
  addWorkshop: (workshop: Omit<WorkshopItem, 'type' | 'reservedUntil'>) => void;
  addProduct: (product: Omit<ProductItem, 'type'>) => boolean;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setOrderData: (order: OrderData) => void;
  clearOrderData: () => void;
  total: number;
};

const CART_STORAGE_KEY = 'tho-cart-items';
const ORDER_STORAGE_KEY = 'tho-last-order';
const CartContext = createContext<CartContextType | undefined>(undefined);

function readCartFromStorage() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const now = Date.now();
    const parsed = JSON.parse(stored) as CartItem[];
    return parsed.filter((item) => item.type !== 'workshop' || item.reservedUntil > now);
  } catch {
    return [];
  }
}

function readOrderFromStorage() {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(ORDER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as OrderData) : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCartFromStorage);
  const [orderData, setOrderDataState] = useState<OrderData | null>(readOrderFromStorage);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (orderData) {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderData));
    } else {
      window.localStorage.removeItem(ORDER_STORAGE_KEY);
    }
  }, [orderData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setItems((prev) => prev.filter((item) => item.type !== 'workshop' || item.reservedUntil > now));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addWorkshop = (workshop: Omit<WorkshopItem, 'type' | 'reservedUntil'>) => {
    const reservedUntil = Date.now() + 5 * 60 * 1000;
    setItems((prev) => [...prev, { ...workshop, type: 'workshop', reservedUntil }]);
  };

  const addProduct = (product: Omit<ProductItem, 'type'>) => {
    const existing = items.find((item) => item.type === 'product' && item.id === product.id);
    const currentQuantity = existing?.type === 'product' ? existing.quantity : 0;
    const nextQuantity = currentQuantity + product.quantity;

    if (product.stockQty !== undefined && nextQuantity > product.stockQty) {
      return false;
    }

    setItems((prev) => {
      const existingInCart = prev.find((item) => item.type === 'product' && item.id === product.id);

      if (existingInCart?.type === 'product') {
        const nextCartQuantity = existingInCart.quantity + product.quantity;
        if (product.stockQty !== undefined && nextCartQuantity > product.stockQty) {
          return prev;
        }

        return prev.map((item) =>
          item.type === 'product' && item.id === product.id
            ? { ...item, quantity: nextCartQuantity, stockQty: product.stockQty ?? item.stockQty }
            : item,
        );
      }

      if (product.stockQty !== undefined && product.quantity > product.stockQty) {
        return prev;
      }

      return [...prev, { ...product, type: 'product' }];
    });
    return true;
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.type === 'product' && item.id === id
          ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stockQty ?? 999) }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const setOrderData = (order: OrderData) => {
    setOrderDataState(order);
  };

  const clearOrderData = () => {
    setOrderDataState(null);
  };

  const total = items.reduce((sum, item) => {
    if (item.type === 'workshop') {
      return sum + item.price * item.tickets;
    }
    return sum + item.price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        orderData,
        addWorkshop,
        addProduct,
        removeItem,
        updateQuantity,
        clearCart,
        setOrderData,
        clearOrderData,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
