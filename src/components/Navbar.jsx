import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Menu, X, Upload, BookOpen, Bell, Search } from 'lucide-react';

export default function Navbar({ cartCount = 0, userRole = 'user', onAdminClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-slate-800">
              BookVerse
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {searchOpen ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center"
              >
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
                <button onClick={() => setSearchOpen(false)} className="ml-2 p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </motion.div>
            ) : (
              <>
                {!isAdmin && (
                  <>
                    <Link to="/" className="px-3 py-2 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors rounded-lg hover:bg-blue-50">
                      Browse
                    </Link>
                    <Link to="/cart" className="px-3 py-2 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors rounded-lg hover:bg-blue-50">
                      Cart
                    </Link>
                  </>
                )}
                {userRole === 'admin' && (
                  <>
                    <Link to="/admin" className="px-3 py-2 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors rounded-lg hover:bg-blue-50">
                      Dashboard
                    </Link>
                    <button
                      onClick={onAdminClick}
                      className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors rounded-lg hover:bg-blue-50"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                </button>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </>
            )}
          </div>

          {!isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>
              <button
                className="md:hidden p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div key="close" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                      <X className="w-5 h-5 text-gray-600" />
                    </motion.div>
                  ) : (
                    <motion.div key="open" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                      <Menu className="w-5 h-5 text-gray-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          )}

          <div className="md:hidden flex items-center gap-2">
            <Link to="/cart" className="relative p-2.5 rounded-xl bg-blue-50">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <button
              className="p-2.5 rounded-xl bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <Menu className="w-5 h-5 text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden py-4 border-t border-gray-100"
            >
              <div className="flex flex-col gap-1">
                {!isAdmin && (
                  <>
                    <Link to="/" className="px-4 py-3 text-gray-600 hover:bg-blue-50 rounded-xl font-medium" onClick={() => setMobileOpen(false)}>
                      Browse
                    </Link>
                    <Link to="/cart" className="px-4 py-3 text-gray-600 hover:bg-blue-50 rounded-xl font-medium" onClick={() => setMobileOpen(false)}>
                      Cart
                    </Link>
                  </>
                )}
                {userRole === 'admin' && (
                  <>
                    <Link to="/admin" className="px-4 py-3 text-gray-600 hover:bg-blue-50 rounded-xl font-medium" onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { onAdminClick?.(); setMobileOpen(false); }}
                      className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-blue-50 rounded-xl font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Upload Book
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
