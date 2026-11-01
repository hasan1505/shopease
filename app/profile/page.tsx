'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/services';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Package, Settings, LogOut, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || '' });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authService.updateProfile(form);
      updateUser(res.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-surface min-h-screen">
        <div className="page-container py-10">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="md:col-span-1">
              <div className="card p-5 text-center mb-4">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-black text-primary">{user.name[0].toUpperCase()}</span>
                </div>
                <p className="font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <span className={`badge mt-2 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'badge-green'}`}>
                  {user.role}
                </span>
              </div>

              <nav className="card p-2 space-y-0.5">
                {[
                  { icon: User, label: 'Profile', active: true },
                  { icon: Package, label: 'My Orders', href: '/orders' },
                  { icon: Settings, label: 'Settings' },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors
                    ${label === 'Profile' ? 'bg-primary-light text-primary font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Icon size={16} /> {label}
                  </button>
                ))}
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </nav>
            </aside>

            {/* Main Content */}
            <div className="md:col-span-3 space-y-6">
              {/* Personal Info */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="btn-ghost text-sm gap-1.5">
                      <Edit2 size={14} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(false)} className="btn-ghost text-sm gap-1.5">
                        <X size={14} /> Cancel
                      </button>
                      <button onClick={handleSave} disabled={saving} className="btn-primary text-sm gap-1.5">
                        <Save size={14} /> {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                    {editing ? (
                      <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
                    ) : (
                      <p className="text-slate-800 font-medium">{user.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Email</label>
                    <p className="text-slate-800 font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Phone</label>
                    {editing ? (
                      <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input-field" />
                    ) : (
                      <p className="text-slate-800 font-medium">{user.phone || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Member Since</label>
                    <p className="text-slate-800 font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Orders', value: '0', color: 'bg-blue-50 text-blue-600' },
                  { label: 'Wishlist Items', value: '0', color: 'bg-red-50 text-red-600' },
                  { label: 'Reviews Given', value: '0', color: 'bg-amber-50 text-amber-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`card p-5 text-center ${color}`}>
                    <p className="text-3xl font-black mb-1">{value}</p>
                    <p className="text-sm font-medium opacity-80">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
