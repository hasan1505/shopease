'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/lib/services';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Package, ArrowLeft } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      orderService.getMyOrders()
        .then((r) => setOrders(r.data))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-surface min-h-screen">
        <div className="page-container py-10">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/profile" className="btn-ghost p-2">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="section-title">My Orders</h1>
              <p className="text-slate-500 text-sm">{orders.length} orders placed</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-6 h-28 skeleton" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-16 text-center">
              <Package size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">No orders yet</h3>
              <p className="text-slate-500 text-sm mb-6">Your order history will appear here once you make a purchase.</p>
              <Link href="/products" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="card p-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-mono text-sm text-slate-500">#{order._id.slice(-10).toUpperCase()}</p>
                        <span className={`badge text-xs ${ORDER_STATUSES[order.status]?.color}`}>
                          {ORDER_STATUSES[order.status]?.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{formatPrice(order.totalPrice)}</p>
                      <p className="text-xs text-slate-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap gap-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-sm text-slate-400">+{order.items.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
