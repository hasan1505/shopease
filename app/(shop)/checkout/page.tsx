'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/lib/services';
import { formatPrice } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/constants';
import type { CheckoutFormData } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, Truck, ArrowRight, Lock, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const STEPS = ['Shipping', 'Payment', 'Review'];

const initialForm: CheckoutFormData = {
  firstName: '', lastName: '', email: '', phone: '',
  street: '', city: '', state: '', zipCode: '', country: 'US',
  paymentMethod: 'card',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CheckoutFormData>({
    ...initialForm,
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/login');
  }, [isLoading, isAuthenticated, router]);

  if (items.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <ShoppingBag size={64} className="text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Your cart is empty</h2>
        <Link href="/products" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
      </div>
    );
  }

  const update = (field: keyof CheckoutFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) { setStep((s) => s + 1); return; }

    setLoading(true);
    try {
      const orderData = {
        ...form,
        items: items.map((i) => ({
          product: i.product._id,
          name: i.product.name,
          image: i.product.images?.[0] || '',
          price: i.product.price,
          quantity: i.quantity,
        })),
        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
        },
        itemsPrice: subtotal,
        shippingPrice: shipping,
        totalPrice: total,
      };
      const res = await orderService.create(orderData as never);
      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/order-confirmation?orderId=${res.data._id}`);
    } catch (err) {
      if (api.isAxiosError(err)) {
        const msg =
          (err.response?.data as { message?: string })?.message ||
          'Could not place your order. Please try again.';
        toast.error(msg);
      } else {
        toast.error('Could not place your order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${i <= step ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs
                border-current">{i + 1}</span>
              {s}
            </div>
            {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                  <Truck size={16} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold">Shipping Information</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">First Name *</label>
                  <input required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Last Name *</label>
                  <input required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone *</label>
                  <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Street Address *</label>
                  <input required value={form.street} onChange={(e) => update('street', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">City *</label>
                  <input required value={form.city} onChange={(e) => update('city', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">State *</label>
                  <input required value={form.state} onChange={(e) => update('state', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">ZIP Code *</label>
                  <input required value={form.zipCode} onChange={(e) => update('zipCode', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Country</label>
                  <input value={form.country} onChange={(e) => update('country', e.target.value)} className="input-field" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="card p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                  <CreditCard size={16} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${form.paymentMethod === pm.value ? 'border-primary bg-primary-light' : 'border-border hover:border-slate-300'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.value}
                      checked={form.paymentMethod === pm.value}
                      onChange={(e) => update('paymentMethod', e.target.value)}
                      className="text-primary"
                    />
                    <span className="font-medium text-sm">{pm.label}</span>
                  </label>
                ))}
              </div>

              {form.paymentMethod === 'card' && (
                <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-border space-y-4">
                  <p className="text-xs text-slate-500">Card details (demo — not collected)</p>
                  <input placeholder="Card number" className="input-field" readOnly />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="MM/YY" className="input-field" readOnly />
                    <input placeholder="CVV" className="input-field" readOnly />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-5">Review Your Order</h2>
              <div className="space-y-4">
                <div className="bg-surface rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Shipping to</p>
                  <p className="text-sm text-slate-700">{form.firstName} {form.lastName}</p>
                  <p className="text-sm text-slate-600">{form.street}, {form.city}, {form.state} {form.zipCode}</p>
                  <p className="text-sm text-slate-600">{form.email} | {form.phone}</p>
                </div>
                <div className="bg-surface rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Payment</p>
                  <p className="text-sm text-slate-700">
                    {PAYMENT_METHODS.find((p) => p.value === form.paymentMethod)?.label}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost">
                Back
              </button>
            ) : (
              <Link href="/cart" className="btn-ghost">Back to Cart</Link>
            )}
            <button type="submit" disabled={loading} className="btn-primary py-3 px-8 text-base disabled:opacity-60">
              {loading ? 'Placing Order…' : step < STEPS.length - 1 ? 'Continue' : 'Place Order'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </form>

        {/* Summary Sidebar */}
        <div className="card p-6 h-fit sticky top-24">
          <h3 className="font-bold text-slate-800 mb-4">Order Summary</h3>
          <div className="space-y-3 mb-5">
            {items.map(({ product, quantity }) => (
              <div key={product._id} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                  <Image src={product.images?.[0] || ''} alt={product.name} fill className="object-cover" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 line-clamp-1">{product.name}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(product.price * quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping</span><span className={shipping === 0 ? 'text-primary' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-border">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Lock size={12} /> Secured by 256-bit SSL encryption
          </div>
        </div>
      </div>
    </div>
  );
}
