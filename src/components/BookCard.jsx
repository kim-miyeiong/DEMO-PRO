import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Download, FileText } from 'lucide-react';
import { downloadFile } from '../api/client.js';
import { getBookCoverUrl, handleImageError } from '../utils/bookImage.js';

export default function BookCard({ book, index = 0 }) {
  const isPdf = book.fileType === 'pdf' || book.pdfFile;
  const coverUrl = getBookCoverUrl(book);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.5), ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link to={`/book/${book.id}`} className="block">
        <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden card-hover">
          <div className="relative h-52 sm:h-60 overflow-hidden">
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
              onError={(e) => handleImageError(e, book.title)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {isPdf && (
              <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                PDF
              </span>
            )}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
              {book.pdfFile && (
                <button
                  onClick={(e) => { e.stopPropagation(); downloadFile(book.pdfFile); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-800 text-xs font-medium hover:bg-white transition-colors shadow-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              )}
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              {book.category && (
                <span className="px-2.5 py-1 bg-blue-50 rounded-lg text-[11px] font-medium text-blue-600 uppercase tracking-wider">
                  {book.category}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-slate-800 line-clamp-1 text-base leading-tight mb-1.5 group-hover:text-blue-600 transition-colors duration-300">
              {book.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{book.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold font-display text-blue-600">
                  ${(Number(book.price) || 0).toFixed(2)}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl btn-primary"
                title="Add to Cart"
                onClick={(e) => e.preventDefault()}
              >
                <ShoppingCart className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
