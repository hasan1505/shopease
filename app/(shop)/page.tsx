'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, Truck, Shield, RefreshCcw, Star, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/StateComponents';
import { productService, categoryService } from '@/lib/services';
import type { Product, Category } from '@/types';
import toast from 'react-hot-toast';

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: 'from-blue-400 to-blue-600',
  Fashion: 'from-pink-400 to-rose-600',
  'Home & Kitchen': 'from-amber-400 to-orange-500',
  Books: 'from-emerald-400 to-green-600',
  Sports: 'from-cyan-400 to-sky-600',
  Beauty: 'from-purple-400 to-violet-600',
};

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50', color: 'bg-blue-50 text-blue-600' },
  { icon: Shield, title: 'Secure Payment', desc: '100% safe transactions', color: 'bg-green-50 text-green-600' },
  { icon: RefreshCcw, title: 'Easy Returns', desc: '30-day return policy', color: 'bg-orange-50 text-orange-600' },
  { icon: Star, title: 'Top Quality', desc: 'Curated premium products', color: 'bg-purple-50 text-purple-600' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featuredRes, trendingRes, catRes] = await Promise.all([
          productService.getFeatured(),
          productService.getTrending(),
          categoryService.getAll(),
        ]);
        setFeatured(featuredRes.data);
        setTrending(trendingRes.data);
        setCategories(catRes.data);
      } catch {
        // Silently degrade — pages still render
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thanks for subscribing! 🎉');
    setEmail('');
  };

  return (
    <div>
      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="page-container py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <span className="badge badge-green mb-4 text-xs">🎉 New Season Sale — Up to 40% Off</span>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                Shop Smarter,<br />
                <span className="text-primary">Live Better</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-md leading-relaxed">
                Discover thousands of premium products across every category. Quality you can trust, prices you'll love.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products" className="btn-primary text-base px-6 py-3">
                  <ShoppingBag size={18} /> Shop Now
                </Link>
                <Link href="/products?sort=rating" className="btn-outline text-base px-6 py-3">
                  Top Rated <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                {[['50K+', 'Happy Customers'], ['10K+', 'Products'], ['4.9★', 'Avg Rating']].map(([num, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-black text-slate-900">{num}</div>
                    <div className="text-xs text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-white/30 rounded-3xl backdrop-blur-sm" />
                <Image
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=600&fit=crop"
                  alt="Shop products"
                  fill
                  className="object-cover rounded-3xl shadow-2xl"
                  priority
                />
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                    <Truck size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Free Delivery</p>
                    <p className="text-sm font-bold text-slate-800">Orders over $50</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">This week</p>
                  <p className="text-lg font-black text-primary">2,400+</p>
                  <p className="text-xs text-slate-600">Items Sold</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ─── Features Bar ──────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-border">
        <div className="page-container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-surface">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle mt-1">Browse our curated collections</p>
            </div>
            <Link href="/products" className="btn-ghost text-sm gap-1 hidden sm:flex">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
                >
                  <Image
                    src={cat.image || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300'}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${CATEGORY_COLORS[cat.name] || 'from-slate-600 to-slate-800'} opacity-60 group-hover:opacity-70 transition-opacity`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                    <h3 className="text-white font-bold text-sm drop-shadow">{cat.name}</h3>
                    {cat.productCount !== undefined && (
                      <p className="text-white/80 text-xs">{cat.productCount} items</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Featured Products ──────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle mt-1">Hand-picked for quality & value</p>
            </div>
            <Link href="/products?featured=true" className="btn-outline text-sm hidden sm:flex">
              See All <ArrowRight size={15} />
            </Link>
          </div>
          <div className="product-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ─── Promo Banner ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-surface">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-emerald-700 p-10 md:p-16">
            <div className="relative z-10 max-w-lg">
              <span className="badge bg-white/20 text-white mb-4">Limited Time Offer</span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Get 20% Off Your First Order
              </h2>
              <p className="text-emerald-100 mb-8">
                Sign up now and use code <strong className="text-white">WELCOME20</strong> at checkout.
              </p>
              <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:shadow-xl transition-all">
                Claim Offer <ArrowRight size={16} />
              </Link>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10">
              <div className="absolute right-10 top-10 w-40 h-40 rounded-full bg-white" />
              <div className="absolute right-40 bottom-10 w-24 h-24 rounded-full bg-white" />
              <div className="absolute right-20 top-1/2 w-16 h-16 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trending Products ──────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">🔥 Trending Now</h2>
              <p className="section-subtitle mt-1">What everyone is buying this week</p>
            </div>
            <Link href="/products?sort=trending" className="btn-outline text-sm hidden sm:flex">
              View All <ArrowRight size={15} />
            </Link>
          </div>
          <div className="product-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : trending.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ─── Newsletter ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-900">
        <div className="page-container text-center">
          <div className="max-w-xl mx-auto">
            <span className="badge bg-primary/20 text-primary mb-4">Newsletter</span>
            <h2 className="text-3xl font-black text-white mb-3">
              Never Miss a Deal
            </h2>
            <p className="text-slate-400 mb-8">
              Join 50,000+ subscribers and get weekly deals, new arrivals, and exclusive discounts delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 flex-1"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
            <p className="text-slate-600 text-xs mt-4">No spam ever. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
