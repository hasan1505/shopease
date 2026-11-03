'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton, EmptyState } from '@/components/StateComponents';
import { productService, categoryService } from '@/lib/services';
import type { Product, Category } from '@/types';
import { SORT_OPTIONS } from '@/lib/constants';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="page-container py-8 text-slate-500">Loading products…</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter state derived from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const [localSearch, setLocalSearch] = useState(search);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('page');
      router.push(`/products?${params.toString()}`);
      setPage(1);
    },
    [searchParams, router]
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({
        search: search || undefined,
        category: category || undefined,
        sort: sort as never,
        page,
        limit: 12,
      });
      setProducts(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    categoryService.getAll().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', localSearch);
  };

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title">All Products</h1>
        <p className="text-slate-500 text-sm mt-1">
          {loading ? 'Loading…' : `${total.toLocaleString()} products found`}
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <button
            type="submit"
            aria-label="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
          >
            <Search size={16} />
          </button>
          <input
            type="search"
            placeholder="Search products…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="input-field pl-9"
          />
        </form>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input-field appearance-none pr-9 cursor-pointer min-w-44"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Filter toggle mobile */}
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className="btn-outline flex items-center gap-2 sm:hidden"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`
          ${filterOpen ? 'block' : 'hidden'} sm:block
          w-full sm:w-56 lg:w-64 flex-shrink-0
        `}>
          <div className="card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Filters</h3>
              {(category || search) && (
                <button
                  onClick={() => { updateParam('category', ''); updateParam('search', ''); setLocalSearch(''); }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Category</h4>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => updateParam('category', '')}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors
                      ${!category ? 'bg-primary-light text-primary font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <button
                      onClick={() => updateParam('category', cat.slug)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between
                        ${category === cat.slug ? 'bg-primary-light text-primary font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {cat.name}
                      {cat.productCount !== undefined && (
                        <span className="text-xs text-slate-400">{cat.productCount}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {/* Active filters chips */}
          {(search || category) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && (
                <span className="badge bg-slate-100 text-slate-700 gap-1.5">
                  Search: "{search}"
                  <button onClick={() => { updateParam('search', ''); setLocalSearch(''); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {category && (
                <span className="badge bg-slate-100 text-slate-700 gap-1.5">
                  {categories.find((c) => c.slug === category)?.name || category}
                  <button onClick={() => updateParam('category', '')}>
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={
                <button onClick={() => { updateParam('search', ''); updateParam('category', ''); setLocalSearch(''); }} className="btn-primary">
                  Clear Filters
                </button>
              }
            />
          ) : (
            <>
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="btn-outline text-sm py-2 px-4 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                          ${page === p ? 'bg-primary text-white' : 'bg-white border border-border text-slate-700 hover:bg-slate-50'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn-outline text-sm py-2 px-4 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
