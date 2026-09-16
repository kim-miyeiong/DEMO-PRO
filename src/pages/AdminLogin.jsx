import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, BookOpen, AlertCircle } from 'lucide-react';
import { adminLogin } from '../api/client.js';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await adminLogin(username, password);
      login(data.token, data.username);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-white/15">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-white">Admin Login</h1>
                <p className="text-blue-100 text-sm">BookVerse Admin Panel</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoFocus
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 btn-primary disabled:opacity-50 rounded-xl"
            >
              {loading ? (
                <>Logging in...</>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign In
                </>
              )}
            </motion.button>

            <p className="text-center text-xs text-gray-400">
              Demo credentials: <span className="font-mono">admin</span> / <span className="font-mono">admin123</span>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
