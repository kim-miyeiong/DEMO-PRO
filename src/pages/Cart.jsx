import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, CreditCard, ArrowRight, Minus, Plus, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '../hooks/useCart.js';
import BookCard from '../components/BookCard.jsx';
import { useBooks } from '../hooks/useBooks.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Cart({ userId, cartItems, cartTotal }) {
  const navigate = useNavigate();
  const { removeItem, checkout } = useCart(userId);
  const { books } = useBooks();
  const { addToast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [quantities, setQuantities] = useState({});

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    const result = await checkout();
    setCheckoutLoading(false);
    if (result.success) {
      navigate('/checkout');
    }
  };

  const updateQuantity = (item, delta) => {
    const newQty = (quantities[item.id] || item.quantity) + delta;
    if (newQty < 1) return;
    setQuantities(prev => ({ ...prev, [item.id]: newQty }));
  };

  const getQty = (item) => quantities[item.id] ?? item.quantity;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 font-medium mb-6 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-800 mb-8 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50">
              <ShoppingBag className="w-7 h-7 text-blue-600" />
            </div>
            Shopping Cart
            <span className="text-gray-500 text-lg font-normal">({cartItems.length} items)</span>
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Browse our collection and add some books</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-xl"
              >
                Browse Books
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 bg-white border border-gray-200 rounded-2xl p-4 card-hover"
                  >
                    <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={item.coverImage ? `/uploads/${encodeURIComponent(item.coverImage)}` : `https://covers.openlibrary.org/b/title/${encodeURIComponent(item.title.replace(/\s+/g, '+'))}-M.jpg`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://picsum.photos/seed/${encodeURIComponent(item.title)}/100/150`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="font-semibold text-slate-800 truncate">{item.title}</h3>
                      {item.author && <p className="text-gray-400 text-xs">{item.author}</p>}
                      <p className="text-blue-600 font-bold mt-1">${(item.price * getQty(item)).toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
                          <button onClick={() => updateQuantity(item, -1)} className="p-1.5 hover:text-blue-600 text-gray-500 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium text-slate-800 w-6 text-center">{getQty(item)}</span>
                          <button onClick={() => updateQuantity(item, 1)} className="p-1.5 hover:text-blue-600 text-gray-500 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs text-gray-400">${item.price.toFixed(2)} each</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { removeItem(item.id); addToast('Removed from cart', 'info'); }}
                      className="self-start p-2.5 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 mb-6">Order Summary</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-500 text-sm">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-800">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-sm">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="border-t border-gray-100 pt-4 flex justify-between">
                      <span className="font-bold text-slate-800">Total</span>
                      <span className="font-bold text-blue-600 text-2xl font-display">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 btn-primary disabled:opacity-50 rounded-xl"
                  >
                    <CreditCard className="w-5 h-5" />
                    {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                  </motion.button>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <Lock className="w-3 h-3 text-gray-400" />
                    <p className="text-center text-xs text-gray-400">
                      Demo payment - no real charge
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold font-display text-slate-800 mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.filter(b => !cartItems.find(i => i.bookId === b.id)).slice(0, 4).map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
