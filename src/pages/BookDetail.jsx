import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Download, ImageIcon, Heart, Share2, FileText, Lock } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBooks } from '../hooks/useBooks.js';
import { useCart } from '../hooks/useCart.js';
import { downloadFile } from '../api/client.js';
import BookCard from '../components/BookCard.jsx';
import { getBookCoverUrl, getBookCoverFallback, getMockCover, handleImageError } from '../utils/bookImage.js';
import Checkout from './Checkout.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function BookDetail({ userId, cartItems, cartTotal }) {
  const { id } = useParams();
  const { books, loading, error } = useBooks();
  const { addItem } = useCart(userId);
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const book = books.find(b => b.id === Number(id));

  const handleAddToCart = async () => {
    if (!userId || !book) return;
    setAdding(true);
    await addItem(book.id);
    setAdding(false);
    addToast(`Added to cart: ${book.title}`, 'success');
  };

  const handleBuyNow = () => {
    if (!userId) return;
    setShowCheckout(true);
  };

  const [purchased, setPurchased] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('purchased_books') || '[]');
    } catch {
      return [];
    }
  });

  const markPurchased = (bookId) => {
    const updated = [...purchased, bookId];
    localStorage.setItem('purchased_books', JSON.stringify(updated));
    setPurchased(updated);
  };

  const isPurchased = book && purchased.includes(book.id);
  const handleCheckoutSuccess = () => {
    if (book) markPurchased(book.id);
    setShowCheckout(false);
    addToast('Payment successful! You can now download.', 'success');
  };
  const handleDownload = () => {
    if (book?.pdfFile && isPurchased) {
      downloadFile(book.pdfFile, 'session');
      addToast('Download started', 'success');
    } else {
      addToast('Please complete checkout first', 'error');
    }
  };
  const coverUrl = book && !imgError ? getBookCoverUrl(book) : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Book Not Found</h2>
          <Link to="/" className="text-blue-600 hover:underline font-medium">Go back home</Link>
        </div>
      </div>
    );
  }

  const isPdf = book.fileType === 'pdf' || book.pdfFile;
  const inCart = cartItems.some(item => item.bookId === book.id);
  const hasPaymentToken = cartItems.some(item => item._paymentToken);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {showCheckout && (
            <div className="mb-8">
              <button
                onClick={() => setShowCheckout(false)}
                className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 font-medium mb-4 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to book
              </button>
              <Checkout
                userId={userId}
                cartItems={[{ bookId: book.id, title: book.title, price: book.price, quantity: 1, pdfFile: book.pdfFile, hasPdf: isPdf }]}
                cartTotal={book.price}
                onSuccess={handleCheckoutSuccess}
              />
            </div>
          )}

          {!showCheckout && (
            <>
              <Link to="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 font-medium mb-6 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Browse
              </Link>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-gray-200 rounded-2xl overflow-hidden card-hover">
                {/* Cover */}
                <div className="h-80 md:h-auto min-h-[400px] bg-gray-50 relative overflow-hidden">
                  {!imgError && coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : null}
                  {(imgError || !coverUrl) && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
                      <span className="text-white text-6xl font-display font-bold">{book.title.charAt(0)}</span>
                    </div>
                  )}
                  {isPdf && (
                    <span className="absolute bottom-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                      PDF
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 md:p-10 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    {book.category && (
                      <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                        {book.category}
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-800 mb-2 leading-tight">{book.title}</h1>
                  {book.author && (
                    <p className="text-gray-500 mb-4 text-lg">by <span className="text-gray-700">{book.author}</span></p>
                  )}
                  <p className="text-gray-600 leading-relaxed mb-8">{book.description}</p>

                  <div className="flex items-center gap-3 mb-8">
                    <button
                      onClick={() => setLiked(!liked)}
                      className={`p-3 rounded-xl transition-all ${liked ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-50 text-gray-400 hover:text-red-400 hover:bg-red-50 border border-gray-200 hover:border-red-200'}`}
                    >
                      <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
                    </button>
                    <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl font-bold font-display text-blue-600">
                        ${book.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBuyNow}
                        className="flex items-center gap-2 px-8 py-3.5 btn-primary rounded-xl"
                      >
                        <FileText className="w-5 h-5" />
                        Buy & Download
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToCart}
                        disabled={adding}
                        className={`flex items-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-all ${
                          inCart
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {adding ? 'Adding...' : inCart ? 'In Cart' : 'Add to Cart'}
                      </motion.button>

                      {book.pdfFile && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleDownload}
                          disabled={!isPurchased}
                          className={`flex items-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-all ${
                            isPurchased
                              ? 'btn-orange'
                              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          }`}
                          title="Download (requires checkout)"
                        >
                          <Download className="w-5 h-5" />
                          Download
                        </motion.button>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {isPurchased ? 'PDF download unlocked' : 'PDF download unlocked after purchase'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16">
                <h2 className="text-xl font-bold font-display text-slate-800 mb-6">More Books</h2>
                <RelatedBooks currentId={id} />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function RelatedBooks({ currentId }) {
  const { books, loading } = useBooks();
  const related = books.filter(b => b.id !== Number(currentId)).slice(0, 4);

  if (loading || related.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {related.map((book, i) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <BookCard book={book} index={i} />
        </motion.div>
      ))}
    </div>
  );
}
