'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { EmptyState } from '@/components/StateComponents';
import { formatPrice } from '@/lib/utils';
import { SHIPPING_THRESHOLD } from '@/lib/constants';

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, shipping, total, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="page-container py-20">
        <EmptyState
          icon={<ShoppingBag size={64} />}
          title="Your cart is empty"
          description="Add some products to your cart and they'll show up here."
          action={<Link href="/products" className="btn-primary">Start Shopping</Link>}
        />
      </div>
    );
  }

  const freeShippingRemaining = SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-2">Shopping Cart</h1>
      <p className="text-slate-500 text-sm mb-8">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>

      {/* Free shipping progress */}
      {freeShippingRemaining > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Tag size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Add <strong>{formatPrice(freeShippingRemaining)}</strong> more for free shipping!
          </p>
          <div className="flex-1 h-2 bg-amber-200 rounded-full overflow-hidden ml-2">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="card p-5 flex gap-4 hover:shadow-md">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface flex-shrink-0">
                <Image
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${product._id}`} className="font-semibold text-slate-800 hover:text-primary transition-colors line-clamp-1 text-sm">
                  {product.name}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">
                  {typeof product.category === 'string' ? product.category : (product.category as never as { name: string }).name}
                </p>
                <p className="text-primary font-bold mt-1">{formatPrice(product.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  {/* Qty controls */}
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(product._id, quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      onClick={() => updateQty(product._id, Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800">{formatPrice(product.price * quantity)}</span>
                    <button
                      onClick={() => removeItem(product._id)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal ({totalItems} items)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-primary' : ''}`}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-slate-800">Total</span>
                <span className="font-black text-lg text-slate-900">{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full justify-center mt-6 py-3 text-base">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <Link href="/products" className="btn-ghost w-full justify-center mt-3 text-sm">
              Continue Shopping
            </Link>

            {/* Trust */}
            <div className="mt-6 pt-5 border-t border-border text-center">
              <p className="text-xs text-slate-400">🔒 Secure checkout powered by SSL encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
