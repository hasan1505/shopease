'use client';

import { useState, useEffect } from 'react';
import { productService, categoryService } from '@/lib/services';
import type { Product, Category } from '@/types';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

type ProductForm = {
  name: string; description: string; price: string; originalPrice: string;
  category: string; brand: string; stock: string; isFeatured: boolean; isTrending: boolean;
  images: string;
};

const emptyForm: ProductForm = {
  name: '', description: '', price: '', originalPrice: '',
  category: '', brand: '', stock: '', isFeatured: false, isTrending: false, images: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productService.getAll({ limit: 100 }),
        categoryService.getAll(),
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch { setProducts([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingProduct(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      originalPrice: String(p.originalPrice || ''), category: typeof p.category === 'string' ? p.category : p.category?._id || '',
      brand: p.brand, stock: String(p.stock), isFeatured: p.isFeatured, isTrending: p.isTrending,
      images: p.images?.join(', ') || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name, description: form.description,
        price: parseFloat(form.price), originalPrice: parseFloat(form.originalPrice) || undefined,
        category: form.category, brand: form.brand, stock: parseInt(form.stock),
        isFeatured: form.isFeatured, isTrending: form.isTrending,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        tags: [], rating: 0, numReviews: 0,
      };
      if (editingProduct) {
        await productService.update(editingProduct._id, payload as never);
        toast.success('Product updated!');
      } else {
        await productService.create(payload as never);
        toast.success('Product created!');
      }
      setModalOpen(false);
      load();
    } catch { toast.error('Failed to save product'); }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await productService.delete(id);
      toast.success('Product deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Products</h1>
          <p className="text-slate-500 text-sm">{products.length} products total</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-4 px-5"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((p) => (
                <tr key={p._id} className="border-b border-border last:border-0 hover:bg-slate-50">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                        {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    {typeof p.category === 'string' ? p.category : p.category?.name}
                  </td>
                  <td className="py-4 px-5 font-semibold">{formatPrice(p.price)}</td>
                  <td className="py-4 px-5">
                    <span className={`badge text-xs ${p.stock > 0 ? 'badge-green' : 'badge-red'}`}>
                      {p.stock > 0 ? `${p.stock} left` : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex gap-1.5">
                      {p.isFeatured && <span className="badge bg-blue-100 text-blue-700 text-[10px]">Featured</span>}
                      {p.isTrending && <span className="badge bg-orange-100 text-orange-700 text-[10px]">Trending</span>}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="btn-ghost p-2"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Product Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description *</label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field resize-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Price ($) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Original Price ($)</label>
                  <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Category *</label>
                  <select required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input-field">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Brand *</label>
                  <input required value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Stock *</label>
                  <input required type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Image URLs (comma-separated)</label>
                  <input value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} className="input-field" placeholder="https://..." />
                </div>
                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="accent-primary" />
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isTrending} onChange={(e) => setForm((f) => ({ ...f, isTrending: e.target.checked }))} className="accent-primary" />
                    <span className="text-sm">Trending</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                  {saving ? 'Saving…' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
