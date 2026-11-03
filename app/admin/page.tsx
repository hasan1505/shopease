'use client';

import { useState, useEffect } from 'react';
import { adminService, orderService } from '@/lib/services';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';
import type { DashboardStats } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then((r) => setStats(r.data))
      .catch(() => {
        // Fallback demo stats if backend not running
        setStats({
          totalRevenue: 48250.75,
          totalOrders: 324,
          totalProducts: 89,
          totalUsers: 1204,
          recentOrders: [],
          revenueByMonth: [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'bg-green-500', change: '+12.5%' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'bg-blue-500', change: '+8.2%' },
    { label: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: Package, color: 'bg-purple-500', change: '+3.1%' },
    { label: 'Total Customers', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'bg-orange-500', change: '+15.7%' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening with ShopEase.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-6 h-28 skeleton" />)
          : statCards.map(({ label, value, icon: Icon, color, change }) => (
              <div key={label} className="card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{label}</p>
                    <p className="text-2xl font-black text-slate-900">{value}</p>
                  </div>
                  <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs text-green-600 font-medium">
                  <TrendingUp size={12} /> {change} this month
                </div>
              </div>
            ))
        }
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-bold text-slate-800">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="p-6">
          {stats?.recentOrders?.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No orders yet. Connect your backend to see live data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders?.map((order) => (
                    <tr key={order._id} className="border-b border-border last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">#{order._id.slice(-8)}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {typeof order.user === 'string' ? order.user : order.user.name}
                      </td>
                      <td className="py-3 px-4 font-semibold">{formatPrice(order.totalPrice)}</td>
                      <td className="py-3 px-4">
                        <span className={`badge text-xs ${ORDER_STATUSES[order.status]?.color}`}>
                          {ORDER_STATUSES[order.status]?.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
