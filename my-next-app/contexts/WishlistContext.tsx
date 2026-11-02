'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { Product, WishlistState } from '@/types';
import toast from 'react-hot-toast';

interface WishlistContextValue extends WishlistState {
  toggle: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = 'shopease_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as Product[]);
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist on every change — never before rehydration, or the initial
  // empty state would wipe the saved wishlist on reload
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const toggle = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      if (exists) {
        toast.success('Removed from wishlist');
        return prev.filter((p) => p._id !== product._id);
      } else {
        toast.success('Added to wishlist ❤️');
        return [...prev, product];
      }
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((p) => p._id === productId),
    [items]
  );

  const clearWishlist = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
