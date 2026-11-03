'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useState,
} from 'react';
import type { CartItem, CartState, Product } from '@/types';
import { SHIPPING_COST, SHIPPING_THRESHOLD } from '@/lib/constants';
import toast from 'react-hot-toast';

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD'; items: CartItem[] };

function calcTotals(items: CartItem[]): Pick<CartState, 'totalItems' | 'subtotal' | 'shipping' | 'total'> {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  return { totalItems, subtotal, shipping, total: subtotal + shipping };
}

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'LOAD':
      return { items: action.items, ...calcTotals(action.items) };

    case 'ADD_ITEM': {
      const exists = state.items.find((i) => i.product._id === action.product._id);
      const items = exists
        ? state.items.map((i) =>
            i.product._id === action.product._id
              ? { ...i, quantity: Math.min(i.quantity + 1, action.product.stock) }
              : i
          )
        : [...state.items, { product: action.product, quantity: 1 }];
      return { items, ...calcTotals(items) };
    }

    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.product._id !== action.productId);
      return { items, ...calcTotals(items) };
    }

    case 'UPDATE_QTY': {
      const items =
        action.quantity <= 0
          ? state.items.filter((i) => i.product._id !== action.productId)
          : state.items.map((i) =>
              i.product._id === action.productId
                ? { ...i, quantity: action.quantity }
                : i
            );
      return { items, ...calcTotals(items) };
    }

    case 'CLEAR_CART':
      return { items: [], totalItems: 0, subtotal: 0, shipping: 0, total: 0 };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface CartContextValue extends CartState {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'shopease_cart';

const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const items: CartItem[] = JSON.parse(raw);
        dispatch({ type: 'LOAD', items });
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist on every change — never before rehydration, or the initial
  // empty state would wipe the saved cart on reload
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, hydrated]);

  const addItem = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', product });
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
    toast.success('Item removed from cart');
  }, []);

  const updateQty = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QTY', productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const isInCart = useCallback(
    (productId: string) => state.items.some((i) => i.product._id === productId),
    [state.items]
  );

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQty, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
