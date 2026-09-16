import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowLeft, Download, Crown } from 'lucide-react';
import { useOrders } from '../hooks/useOrders.js';
import { downloadFile } from '../api/client.js';
import { getBookCoverUrl, handleImageError } from '../utils/bookImage.js';

export default function OrderSuccess({ userId }) {
  const { orders, loading } = useOrders(userId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
        >
          {/* Success Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center border border-green-200"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-800 mb-3">Order Complete</h1>
            <p className="text-gray-500">Thank you for your purchase! Your books are ready.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
            {orders?.length > 0 ? (
              <div className="space-y-6">
                {orders.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-50">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">Order #{order.orderId}</span>
                          <span className="block text-xs text-gray-400">{order.createdAt}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">
                        Completed
                      </span>
                    </div>
                    <div className="space-y-3">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={getBookCoverUrl(item)}
                              alt=""
                              className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                              loading="lazy"
                              onError={(e) => handleImageError(e, item.title)}
                            />
                            <span className="text-gray-600 truncate text-sm">{item.title}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="font-semibold text-slate-800 text-sm">${item.price.toFixed(2)}</span>
                            {item.pdfFile && (
                              <button
                                onClick={() => downloadFile(item.pdfFile)}
                                className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-slate-800">Total Paid</span>
                      <span className="font-bold text-green-600 text-xl font-display">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Crown className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                <p className="text-gray-500">No orders found.</p>
                <p className="text-gray-400 text-sm mt-1">Your purchase history will appear here.</p>
              </div>
            )}
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 btn-primary rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
