import { createContext, useContext, useEffect, type ReactNode, useState } from 'react';
import type { WorkshopItem } from './WorkshopCartContext';

export type ProductItem = {
  type: 'product';
  id: string;
  name: string;
  price: number;
  quantity: number;
  stockQty?: number;
  image: string;
  gift?: {
    occasion: string;
    includeWrapping: boolean;
    giftNote: string;
  };
  custom?: {
    shape: string;
    glaze: string;
    features: string[];
    engraving: string;
    brief: string;
    multiplier: number;
    basePrice: number;
    artisanLeadDays: number;
  };
};

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
  items: Array<ProductItem | WorkshopItem>;
  subtotal: number;
  shippingFee: number;
  total: number;
  customer: CheckoutAddress;
  createdAt: string;
  paymentMethod: 'momo' | 'vnpay';
};

type ProductCartContextType = {
  productItems: ProductItem[];
  orderData: OrderData | null;
  addProduct: (product: Omit<ProductItem, 'type'>) => boolean;
  removeProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantity: number) => void;
  clearProductCart: () => void;
  setOrderData: (order: OrderData) => void;
  clearOrderData: () => void;
  productTotal: number;
  productCount: number;
};

const PRODUCT_CART_STORAGE_KEY = 'tho-product-cart';
const LEGACY_CART_STORAGE_KEY = 'tho-cart-items';
const ORDER_STORAGE_KEY = 'tho-last-order';
const ProductCartContext = createContext<ProductCartContextType | undefined>(undefined);

function readProductCartFromStorage(): ProductItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(PRODUCT_CART_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as ProductItem[];

    const legacyStored = window.localStorage.getItem(LEGACY_CART_STORAGE_KEY);
    if (!legacyStored) return [];

    const legacyItems = JSON.parse(legacyStored) as Array<ProductItem | WorkshopItem>;
    return legacyItems.filter((item): item is ProductItem => item.type === 'product');
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

export function ProductCartProvider({ children }: { children: ReactNode }) {
  const [productItems, setProductItems] = useState<ProductItem[]>(readProductCartFromStorage);
  const [orderData, setOrderDataState] = useState<OrderData | null>(readOrderFromStorage);

  useEffect(() => {
    window.localStorage.setItem(PRODUCT_CART_STORAGE_KEY, JSON.stringify(productItems));
  }, [productItems]);

  useEffect(() => {
    if (orderData) {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderData));
    } else {
      window.localStorage.removeItem(ORDER_STORAGE_KEY);
    }
  }, [orderData]);

  const addProduct = (product: Omit<ProductItem, 'type'>) => {
    const existing = productItems.find((item) => item.id === product.id);
    const currentQuantity = existing?.quantity ?? 0;
    const nextQuantity = currentQuantity + product.quantity;

    if (product.stockQty !== undefined && nextQuantity > product.stockQty) {
      return false;
    }

    setProductItems((prev) => {
      const existingInCart = prev.find((item) => item.id === product.id);

      if (existingInCart) {
        const nextCartQuantity = existingInCart.quantity + product.quantity;
        if (product.stockQty !== undefined && nextCartQuantity > product.stockQty) {
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
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

  const removeProduct = (id: string) => {
    setProductItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateProductQuantity = (id: string, quantity: number) => {
    setProductItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stockQty ?? 999) }
          : item,
      ),
    );
  };

  const clearProductCart = () => {
    setProductItems([]);
  };

  const setOrderData = (order: OrderData) => {
    setOrderDataState(order);
  };

  const clearOrderData = () => {
    setOrderDataState(null);
  };

  const productTotal = productItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const productCount = productItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ProductCartContext.Provider
      value={{
        productItems,
        orderData,
        addProduct,
        removeProduct,
        updateProductQuantity,
        clearProductCart,
        setOrderData,
        clearOrderData,
        productTotal,
        productCount,
      }}
    >
      {children}
    </ProductCartContext.Provider>
  );
}

export function useProductCart() {
  const context = useContext(ProductCartContext);
  if (!context) throw new Error('useProductCart must be used within ProductCartProvider');
  return context;
}
