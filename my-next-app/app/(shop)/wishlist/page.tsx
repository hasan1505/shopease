'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { EmptyState } from '@/components/StateComponents';
import StarRating from '@/components/StarRating';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { addItem, isInCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="page-container py-20">
        <EmptyState
          icon={<Heart size={64} />}
          title="Your wishlist is empty"
          description="Save products you love and come back to them anytime."
          action={<Link href="/products" className="btn-primary">Discover Products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">My Wishlist</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => {
          const inCart = isInCart(product._id);
          return (
            <div key={product._id} className="product-card group">
              {/* Image */}
              <div className="product-card-image h-52 relative">
                <Image
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => toggle(product)}
                  className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <Link href={`/products/${product._id}`} className="font-semibold text-slate-800 hover:text-primary transition-colors text-sm line-clamp-2 mb-1.5 block">
                  {product.name}
                </Link>
                <StarRating rating={product.rating} numReviews={product.numReviews} />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
                  <button
                    onClick={() => !inCart && product.stock > 0 && addItem(product)}
                    disabled={inCart || product.stock === 0}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all
                      ${inCart ? 'bg-primary-light text-primary' : product.stock === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-hover'}`}
                  >
                    <ShoppingCart size={13} />
                    {inCart ? 'In Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
