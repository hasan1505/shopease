'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart, Heart, ArrowLeft, Truck, Shield, RefreshCcw,
  Plus, Minus, Share2, CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { productService } from '@/lib/services';
import { LoadingSpinner, ErrorState } from '@/components/StateComponents';
import StarRating from '@/components/StarRating';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="page-container py-20 text-slate-500">Loading product…</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}

function ProductDetailContent() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { addItem, isInCart, updateQty, items } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await productService.getById(id);
        setProduct(res.data);
        // Load related (same category)
        const catSlug =
          typeof res.data.category === 'string'
            ? res.data.category
            : (res.data.category as never as { slug: string }).slug;
        const relRes = await productService.getAll({ category: catSlug, limit: 4 });
        setRelated(relRes.data.filter((p) => p._id !== id));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="page-container py-20"><LoadingSpinner fullPage /></div>;
  if (error || !product) return <div className="page-container py-20"><ErrorState message="Product not found." onRetry={() => router.back()} /></div>;

  const inCart = isInCart(product._id);
  const cartItem = items.find((i) => i.product._id === product._id);
  const wishlisted = isWishlisted(product._id);
  const discount = product.originalPrice ? getDiscountPercent(product.originalPrice, product.price) : null;
  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600'];

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Products
      </button>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div>
          <div className="product-card-image aspect-square rounded-2xl overflow-hidden mb-4 bg-surface">
            <Image
              src={images[activeImage]}
              alt={product.name}
              width={600}
              height={600}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-primary' : 'border-border hover:border-slate-300'
                  }`}
                >
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <span className="badge badge-green text-xs">
              {typeof product.category === 'string' ? product.category : (product.category as never as { name: string }).name}
            </span>
            <button onClick={handleShare} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
              <Share2 size={15} />
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} numReviews={product.numReviews} size="md" />
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-slate-900">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-lg text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="badge badge-red">-{discount}%</span>
              </>
            )}
          </div>

          <p className="text-slate-600 leading-relaxed mb-6">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <CheckCircle2 size={16} className="text-primary" />
                <span className="text-sm text-primary font-medium">
                  In Stock ({product.stock} left)
                </span>
              </>
            ) : (
              <span className="badge badge-red">Out of Stock</span>
            )}
          </div>

          {/* Qty + Add to cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-semibold text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 btn-primary py-3 justify-center text-base ${inCart ? 'bg-emerald-700' : ''}`}
              >
                <ShoppingCart size={18} />
                {inCart ? `In Cart (${cartItem?.quantity})` : 'Add to Cart'}
              </button>

              <button
                onClick={() => toggle(product)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all
                  ${wishlisted ? 'border-red-400 bg-red-50 text-red-500' : 'border-border text-slate-500 hover:border-red-400 hover:text-red-400'}`}
              >
                <Heart size={18} className={wishlisted ? 'fill-current' : ''} />
              </button>
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border">
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Over $50' },
              { icon: Shield, label: 'Secure Pay', sub: '100% Safe' },
              { icon: RefreshCcw, label: 'Easy Returns', sub: '30 Days' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Icon size={16} className="text-primary" />
                </div>
                <p className="text-xs font-semibold text-slate-700">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="section-title mb-6">You May Also Like</h2>
          <div className="product-grid">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
