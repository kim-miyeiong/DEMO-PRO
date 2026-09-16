import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingCart, DollarSign, Trash2, Search, Download, Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminStats, deleteBook, downloadFile, subscribeAllOrders } from '../api/client.js';
import { useBooks } from '../hooks/useBooks.js';
import BookCard from '../components/BookCard.jsx';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function AdminDashboard({ logout }) {
  const navigate = useNavigate();
  const { session, logout: logoutAuth } = useAdminAuth();
  const { addToast } = useToast();
  const { books, loading: booksLoading } = useBooks();
  const [stats, setStats] = useState({ bookCount: 0, orderCount: 0, revenue: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await fetchAdminStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    return subscribeAllOrders((msg) => {
      if (msg?.type === 'orders-update') loadStats();
    });
  }, [loadStats]);

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logoutAuth();
    logout();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await deleteBook(id);
      await loadStats();
      addToast('Book deleted', 'info');
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        addToast(err.message || 'Failed to delete', 'error');
      }
    }
  };

  const loading = booksLoading || statsLoading;

  const statCards = [
    { label: 'Total Books', value: stats.bookCount, icon: BookOpen, bgColor: 'bg-blue-50', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
    { label: 'Total Orders', value: stats.orderCount, icon: ShoppingCart, bgColor: 'bg-orange-50', iconColor: 'text-orange-600', borderColor: 'border-orange-200' },
    { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign, bgColor: 'bg-red-50', iconColor: 'text-red-600', borderColor: 'border-red-200' },
  ];


  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display text-slate-800">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage your book store</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 btn-primary rounded-xl"
              >
                <Plus className="w-5 h-5" />
                Add Book
              </motion.button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all bg-white"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white border border-gray-200 rounded-2xl p-6 card-hover"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold font-display text-slate-800">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center border ${stat.borderColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          { error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
              <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No books found</h3>
              <p className="text-gray-500">Upload your first book to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative group"
                >
                  <BookCard book={book} index={i} />
                  <div className="absolute -top-3 -right-3 flex flex-col gap-2 z-10">
                    {book.pdfFile && (
                      <button
                        onClick={() => { downloadFile(book.pdfFile, null); addToast('Test download - no payment required', 'info'); }}
                        className="w-10 h-10 rounded-xl bg-white shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center border border-gray-200"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="w-10 h-10 rounded-xl bg-red-50 shadow-lg hover:bg-red-100 transition-colors flex items-center justify-center border border-red-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
