import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold font-display text-slate-800">BookVerse</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Discover and collect amazing books. Upload your own or browse our curated collection.
            </p>
            <div className="flex gap-3 mt-6">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <button key={i} className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Icon className="w-4 h-4 text-gray-500" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Explore</h4>
            <ul className="space-y-3">
              {['Home', 'Browse Books', 'New Arrivals', 'Trending'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Account</h4>
            <ul className="space-y-3">
              {['My Cart', 'Order History', 'Wishlist', 'Settings'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">For Authors</h4>
            <ul className="space-y-3">
              {['Upload Book', 'Sell on BookVerse', 'Analytics', 'Creator Hub'].map((item) => (
                <li key={item}>
                  <Link to="/admin" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">2026 BookVerse. All rights reserved.</p>
          <div className="flex gap-4">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              Made with love
            </button>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <ShoppingBag className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
