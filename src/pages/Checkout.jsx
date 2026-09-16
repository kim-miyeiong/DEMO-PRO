import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, CheckCircle, Loader2, ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { processPayment } from '../api/client.js';

export default function Checkout({ userId, cartItems, cartTotal, onSuccess }) {
  const [step, setStep] = useState('form');
  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [paymentToken, setPaymentToken] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [processing, setProcessing] = useState(false);

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    }
    return cleaned;
  };

  const validate = () => {
    const errs = {};
    if (!cardholder.trim()) {
      errs.cardholder = 'Cardholder name is required';
    }
    const cleanedCard = cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cleanedCard)) {
      errs.cardNumber = 'Card number must be 16 digits';
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      errs.expiry = 'Expiry must be in MM/YY format';
    } else {
      const [month, year] = expiry.split('/').map(Number);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      if (month < 1 || month > 12) {
        errs.expiry = 'Month must be between 01 and 12';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errs.expiry = 'Card has expired';
      }
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      errs.cvv = 'CVV must be 3 or 4 digits';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStep('processing');
    setProcessing(true);
    try {
      const result = await processPayment({
        userId,
        cardNumber: cardNumber.replace(/\s+/g, ''),
        expiry,
        cvv,
        cartItems: cartItems.map(item => ({
          bookId: item.bookId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
      });
      setPaymentToken(result.token);
      setOrderId(result.orderId);
      setStep('success');
      if (onSuccess) onSuccess(result.token);
    } catch (err) {
      setErrors({ submit: err.message || 'Payment failed. Please try again.' });
      setStep('form');
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Lock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Cart is empty</h3>
        <p className="text-gray-500">Add some books before checking out.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-lg mx-auto"
    >
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Checkout
          </h2>
          <p className="text-blue-100 text-sm mt-1">Demo payment - no real charge</p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Order summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Summary</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate max-w-[180px]">{item.title}</span>
                        <span className="font-medium text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
                    <span className="text-slate-800">Total</span>
                    <span className="text-blue-600">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Test card info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Test Card</p>
                  <p className="text-sm text-blue-700 font-mono">4242 4242 4242 4242</p>
                  <p className="text-xs text-blue-500 mt-1">Any future expiry &bull; Any 3-digit CVV</p>
                </div>

                {/* Cardholder */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardholder}
                    onChange={e => { setCardholder(e.target.value); setErrors(p => ({ ...p, cardholder: '' })); }}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${errors.cardholder ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.cardholder && <p className="text-red-500 text-xs mt-1">{errors.cardholder}</p>}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Card Number</label>
                  <input
                    type="text"
                    value={formatCardNumber(cardNumber)}
                    onChange={e => { setCardNumber(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, cardNumber: '' })); }}
                    placeholder="4242 4242 4242 4242"
                    maxLength="19"
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all font-mono ${errors.cardNumber ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                </div>

                {/* Expiry + CVV */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={formatExpiry(expiry)}
                      onChange={e => { setExpiry(e.target.value.replace(/[^\d/]/g, '')); setErrors(p => ({ ...p, expiry: '' })); }}
                      placeholder="12/25"
                      maxLength="5"
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all font-mono ${errors.expiry ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={e => { setCvv(e.target.value.replace(/\D/g, '').substring(0, 4)); setErrors(p => ({ ...p, cvv: '' })); }}
                      placeholder="123"
                      maxLength="4"
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all font-mono ${errors.cvv ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                  </div>
                </div>

                {errors.submit && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.submit}
                  </div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 btn-primary disabled:opacity-50 rounded-xl"
                >
                  <Lock className="w-5 h-5" />
                  Pay ${cartTotal.toFixed(2)}
                </motion.button>
              </motion.form>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center"
              >
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800">Processing payment...</h3>
                <p className="text-gray-500 mt-1">Please wait</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.3 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-bold font-display text-slate-800 mb-2">Payment Successful</h3>
                <p className="text-gray-500 mb-6">
                  Order #{orderId} completed. Your download is ready.
                </p>
                {paymentToken && cartItems.some(item => item.pdfFile || item.hasPdf) && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 btn-orange rounded-xl"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF(s)
                  </motion.button>
                )}
                <p className="text-xs text-gray-400 mt-4">All downloads are protected and require a valid payment session.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
