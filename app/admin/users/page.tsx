'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/services';
import type { User } from '@/types';
import { formatDate } from '@/lib/utils';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getUsers()
      .then((r) => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">Customers</h1>
        <p className="text-slate-500 text-sm">{users.length} registered users</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                {['User', 'Email', 'Role', 'Joined'].map((h) => (
                  <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="py-4 px-5"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400 text-sm">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    No users found. Connect the backend to see customer data.
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user._id} className="border-b border-border last:border-0 hover:bg-slate-50">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                        {user.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-600">{user.email}</td>
                  <td className="py-4 px-5">
                    <span className={`badge text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'badge-green'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-500 text-xs">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
