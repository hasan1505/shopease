'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/lib/services';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';
import { ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAll();
      setOrders(res.data);
    } catch { setOrders([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await orderService.updateStatus(id, status);
      toast.success('Order status updated');
      load();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">Orders</h1>
        <p className="text-slate-500 text-sm">{orders.length} orders total</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-4 px-5"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-sm">
                    No orders found. Connect the backend to see live orders.
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="border-b border-border last:border-0 hover:bg-slate-50">
                  <td className="py-4 px-5 font-mono text-xs text-slate-600">#{order._id.slice(-8)}</td>
                  <td className="py-4 px-5 font-medium text-slate-800">
                    {typeof order.user === 'string' ? order.user : order.user.name}
                  </td>
                  <td className="py-4 px-5 text-slate-600">{order.items.length} items</td>
                  <td className="py-4 px-5 font-semibold">{formatPrice(order.totalPrice)}</td>
                  <td className="py-4 px-5 capitalize text-slate-600">{order.paymentMethod}</td>
                  <td className="py-4 px-5">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-full cursor-pointer border-0 ${ORDER_STATUSES[order.status]?.color}`}
                      >
                        {Object.entries(ORDER_STATUSES).map(([val, { label }]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-500 text-xs">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
