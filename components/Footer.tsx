'use client';

import Link from 'next/link';
import { ShoppingBag, Mail, Phone, MapPin, Globe, MessageCircle, Camera, Play } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const footerLinks = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=electronics', label: 'Electronics' },
    { href: '/products?category=fashion', label: 'Fashion' },
    { href: '/products?category=home-kitchen', label: 'Home & Kitchen' },
  ],
  account: [
    { href: '/auth/login', label: 'Login' },
    { href: '/auth/register', label: 'Register' },
    { href: '/profile', label: 'My Profile' },
    { href: '/orders', label: 'My Orders' },
  ],
  help: [
    { href: '#', label: 'FAQ' },
    { href: '#', label: 'Shipping Policy' },
    { href: '#', label: 'Return Policy' },
    { href: '#', label: 'Contact Us' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thanks for subscribing! 🎉');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <span className="text-2xl font-black text-white">
                Shop<span className="text-primary">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
              Your premium destination for quality products across every category. Shop smart, live better.
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-primary flex-shrink-0" />
                <span>123 ShopEase Ave, San Francisco, CA 94103</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-primary flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-primary flex-shrink-0" />
                <span>support@shopease.com</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Account</h4>
            <ul className="space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Help</h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-10 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-bold text-lg mb-1">Stay in the loop</h4>
              <p className="text-slate-400 text-sm">Get deals, new arrivals, and exclusive offers.</p>
            </div>
            <form onSubmit={handleNewsletter} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-sm h-10 min-w-0 md:w-64"
              />
              <button type="submit" className="btn-primary text-sm whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© 2026 ShopEase. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {[
              { icon: Globe, href: '#', label: 'Website' },
              { icon: MessageCircle, href: '#', label: 'Chat' },
              { icon: Camera, href: '#', label: 'Instagram' },
              { icon: Play, href: '#', label: 'YouTube' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
