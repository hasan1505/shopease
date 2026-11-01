'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import StarRating from './StarRating';
import type { Product } from '@/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const inCart = isInCart(product._id);
  const wishlisted = isWishlisted(product._id);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? getDiscountPercent(product.originalPrice, product.price)
      : null;

  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400';

  return (
    <div className="product-card group">
      {/* Image */}
      <div className="product-card-image h-56 relative">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <span className="badge badge-red text-[11px]">-{discount}%</span>
          )}
          {product.isTrending && (
            <span className="badge bg-orange-100 text-orange-700 text-[11px]">🔥 Trending</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-slate-100 text-slate-600 text-[11px]">Out of Stock</span>
          )}
        </div>

        {/* Action buttons overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => toggle(product)}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all
              ${wishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white text-slate-600 hover:bg-red-50 hover:text-red-500'
              }`}
            aria-label="Toggle wishlist"
          >
            <Heart size={16} className={wishlisted ? 'fill-current' : ''} />
          </button>
          <Link
            href={`/products/${product._id}`}
            className="w-9 h-9 rounded-full bg-white text-slate-600 flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all"
            aria-label="View product"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
          {typeof product.category === 'string' ? product.category : product.category?.name}
        </p>

        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-primary transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        <StarRating rating={product.rating} numReviews={product.numReviews} />

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={() => !inCart && product.stock > 0 && addItem(product)}
            disabled={inCart || product.stock === 0}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all
              ${inCart
                ? 'bg-primary-light text-primary cursor-default'
                : product.stock === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-hover hover:shadow-md'
              }`}
          >
            <ShoppingCart size={14} />
            {inCart ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
