import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, ImageIcon, FileText, X, Loader2, BookOpen, Sparkles, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { uploadBook, fetchBooks } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

export default function AdminUpload() {
  const navigate = useNavigate();
  const { logout: logoutAuth } = useAdminAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    author: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadedBook, setUploadedBook] = useState(null);

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) setPdfFile(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category || 'General');
    data.append('author', formData.author || '');
    if (coverImage) data.append('coverImage', coverImage);
    if (pdfFile) data.append('pdfFile', pdfFile);

    try {
      const result = await uploadBook(data);
      setUploadedBook(result);
      addToast(`New book live: ${result?.title || 'Unknown'}`, 'success');
      setSuccess(true);
    } catch (err) {
      addToast(err.message || 'Failed to upload book', 'error');
      setError(err.message || 'Failed to upload book');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Art', 'Business', 'Self-Help', 'Children', 'Other'];

  const handleLogout = () => {
    logoutAuth();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <Link to="/admin" className="flex items-center gap-1 text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-sm bg-white"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <Upload className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800">Upload New Book</h1>
              <p className="text-gray-500">Add a new book to the store</p>
            </div>
          </div>

          {success ? (
            <div className="bg-white border border-green-200 rounded-2xl p-8 shadow-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center"
              >
                <BookOpen className="w-8 h-8 text-green-600" />
              </motion.div>
              <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Book Uploaded!</h2>
              <p className="text-gray-500 text-center mb-6">
                <span className="font-medium text-green-600">{uploadedBook?.title}</span> is now live on the store
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setUploadedBook(null);
                    setFormData({ title: '', description: '', price: '', category: '', author: '' });
                    setCoverImage(null);
                    setPdfFile(null);
                    setPreviewImage(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 btn-primary rounded-xl"
                >
                  <Upload className="w-5 h-5" />
                  Add Another Book
                </button>
                <Link
                  to="/"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  View on Store
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium text-sm">
                  {error}
                </div>
              )}

              {/* Cover Image */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  Cover Image
                </h3>
                <div className="flex gap-6">
                  <div className="w-32 h-40 flex-shrink-0">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Book Cover
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-400 mt-2">Recommended: 512x768px (JPG, PNG, WebP)</p>
                  </div>
                </div>
              </div>

              {/* PDF Upload */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-50">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  Book File (PDF)
                </h3>
                <div className="flex gap-6">
                  <div className="w-32 h-40 flex-shrink-0">
                    {pdfFile ? (
                      <div className="w-full h-full bg-red-50 border border-red-200 rounded-xl flex flex-col items-center justify-center">
                        <FileText className="w-10 h-10 text-red-400" />
                        <span className="text-xs text-red-500 mt-2 truncate max-w-[80px]">{pdfFile.name}</span>
                      </div>
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                        <FileText className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      PDF Document
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfChange}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                    />
                    <p className="text-xs text-gray-400 mt-2">Max 50MB</p>
                  </div>
                </div>
              </div>

              {/* Book Details */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  Book Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter book title"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Describe the book..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Author</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="Author name"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all [&>option]:bg-white"
                  >
                    <option value="">General</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-6 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 btn-primary disabled:opacity-50 rounded-xl"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Book
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
