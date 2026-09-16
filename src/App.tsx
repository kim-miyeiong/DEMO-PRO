import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider } from './context/ToastContext.jsx';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { useCart } from './hooks/useCart.js';
import Home from './pages/Home.jsx';
import BookDetail from './pages/BookDetail.jsx';
import Cart from './pages/Cart.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Checkout from './pages/Checkout.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUpload from './pages/AdminUpload.jsx';
import AdminLogin from './pages/AdminLogin.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const transitionConfig = { duration: 0.35, ease: [0.16, 1, 0.3, 1] };

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState(() => {
    let id = localStorage.getItem('demo_user_id');
    if (!id) {
      id = '1';
      localStorage.setItem('demo_user_id', id);
    }
    return id;
  });
  const [isAdmin, setIsAdmin] = useState(() => location.pathname.startsWith('/admin'));
  const { items: cartItems, total: cartTotal } = useCart(userId);
  const { isAdmin: isAdminLoggedIn, logout: logoutAdmin } = useAdminAuth();

  useEffect(() => {
    setIsAdmin(location.pathname.startsWith('/admin'));
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Navbar cartCount={cartItems.length} userRole={isAdminLoggedIn ? 'admin' : 'user'} onAdminClick={() => navigate('/admin/upload')} />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transitionConfig}
        >
          <Routes>
            <Route path="/" element={<Home userId={userId} />} />
            <Route path="/book/:id" element={<BookDetail userId={userId} cartItems={cartItems} cartTotal={cartTotal} />} />
            <Route path="/cart" element={<Cart userId={userId} cartItems={cartItems} cartTotal={cartTotal} />} />
            <Route path="/checkout" element={<Checkout userId={userId} cartItems={cartItems} cartTotal={cartTotal} onSuccess={() => navigate('/order-success')} />} />
            <Route path="/order-success" element={<OrderSuccess userId={userId} />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={isAdminLoggedIn ? <AdminDashboard logout={logoutAdmin} /> : <AdminLogin />} />
            <Route path="/admin/upload" element={isAdminLoggedIn ? <AdminUpload /> : <AdminLogin />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AdminAuthProvider>
    </ToastProvider>
  );
}
