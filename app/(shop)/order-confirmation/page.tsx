'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="page-container py-20 text-center text-slate-500">Loading order confirmation…</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get('orderId') || 'ORD-000';

  return (
    <div className="page-container py-20">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Animation */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-green">
          <CheckCircle2 size={48} className="text-primary" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-3">Order Confirmed! 🎉</h1>
        <p className="text-slate-600 mb-6">
          Thank you for your purchase! Your order has been placed successfully.
        </p>

        <div className="card p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <Package size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Order ID</p>
              <p className="font-bold text-slate-800 font-mono">{orderId}</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Order Placed', done: true, desc: 'Your order is confirmed' },
              { label: 'Processing', done: false, desc: 'Being prepared for shipping' },
              { label: 'Shipped', done: false, desc: 'On its way to you' },
              { label: 'Delivered', done: false, desc: 'Estimated 3–5 business days' },
            ].map(({ label, done, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center
                  ${done ? 'bg-primary' : 'bg-slate-200'}`}>
                  {done && <CheckCircle2 size={12} className="text-white fill-white" />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${done ? 'text-primary' : 'text-slate-400'}`}>{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products" className="btn-primary">
            Continue Shopping <ArrowRight size={16} />
          </Link>
          <Link href="/" className="btn-outline">
            <Home size={16} /> Back to Home
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          A confirmation email will be sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
