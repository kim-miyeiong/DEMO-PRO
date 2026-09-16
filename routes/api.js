import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Book from '../database/models/Book.js';
import Order from '../database/models/Order.js';
import CartItem from '../database/models/Cart.js';
import { emit, subscribe } from '../database/realtime.js';
import { mapBook, mapOrder } from '../database/serializers.js';

const router = express.Router();

router.use(cors());
router.use(express.json());

// ===== Payment tokens store (in-memory for demo) =====
const paymentTokens = new Map();

// ===== Admin sessions store (in-memory for demo) =====
const adminSessions = new Map();

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// ===== Multer setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${uuidv4()}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// ===== Helper: validate card =====
function validateCard(cardNumber, expiry, cvv) {
  const errors = [];
  const cleanedCard = cardNumber.replace(/\s+/g, '');
  if (!/^\d{16}$/.test(cleanedCard)) {
    errors.push('Card number must be 16 digits');
  }
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    errors.push('Expiry must be in MM/YY format');
  } else {
    const [month, year] = expiry.split('/').map(Number);
    if (month < 1 || month > 12) {
      errors.push('Month must be between 01 and 12');
    }
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.push('Card has expired');
    }
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    errors.push('CVV must be 3 or 4 digits');
  }
  return errors;
}

// ===== Admin Auth =====
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = uuidv4();
    adminSessions.set(token, { username, createdAt: Date.now() });
    res.json({ success: true, data: { token, username } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const session = token ? adminSessions.get(token) : null;
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  req.adminSession = session;
  next();
}

// ===== Books =====
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ book_id: 1 }).lean();
    res.json({ success: true, data: books.map(mapBook) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ book_id: parseInt(req.params.id) }).lean();
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
    res.json({ success: true, data: mapBook(book) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/books', requireAdmin, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]), async (req, res) => {
  try {
    if (!req.files?.coverImage?.[0]) {
      return res.status(400).json({ success: false, error: 'Cover image is required' });
    }
    const { title, description, price, category, author } = req.body;
    if (!title || !description || !price) {
      return res.status(400).json({ success: false, error: 'Title, description, and price are required' });
    }

    const count = await Book.countDocuments();
    const lastBook = count > 0 ? await Book.findOne().sort({ book_id: -1 }).lean() : null;
    const newBookId = (lastBook?.book_id ?? 0) + 1;

    const coverFilename = req.files?.coverImage?.[0]?.filename || null;
    const pdfFilename = req.files?.pdfFile?.[0]?.filename || null;
    const pdfSizeKb = req.files?.pdfFile?.[0] ? Math.round(req.files.pdfFile[0].size / 1024) : 0;

    const book = new Book({
      book_id: newBookId,
      title,
      description,
      price: Math.round(parseFloat(price) * 100),
      cover_filename: coverFilename,
      pdf_filename: pdfFilename,
      has_pdf: !!pdfFilename,
      pdf_size_kb: pdfSizeKb,
      author: author || '',
      category: category || 'General',
    });
    await book.save();
    emit('books', mapBook(book));
    res.status(201).json({ success: true, data: mapBook(book) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/books/:id', requireAdmin, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]), async (req, res) => {
  try {
    const { title, description, price, category, author } = req.body;
    const existing = await Book.findOne({ book_id: parseInt(req.params.id) }).lean();
    if (!existing) return res.status(404).json({ success: false, error: 'Book not found' });

    let coverFilename = existing.cover_filename;
    if (req.files?.coverImage?.[0]) {
      if (existing.cover_filename) {
        const oldPath = path.join('uploads', existing.cover_filename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      coverFilename = req.files.coverImage[0].filename;
    }

    let pdfFilename = existing.pdf_filename;
    let pdfSizeKb = existing.pdf_size_kb || 0;
    if (req.files?.pdfFile?.[0]) {
      if (existing.pdf_filename) {
        const oldPath = path.join('uploads', existing.pdf_filename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      pdfFilename = req.files.pdfFile[0].filename;
      pdfSizeKb = Math.round(req.files.pdfFile[0].size / 1024);
    }

    const updated = await Book.findOneAndUpdate(
      { book_id: parseInt(req.params.id) },
      {
        title: title || existing.title,
        description: description || existing.description,
        price: price ? Math.round(parseFloat(price) * 100) : existing.price,
        cover_filename: coverFilename,
        pdf_filename: pdfFilename,
        has_pdf: !!pdfFilename,
        pdf_size_kb: pdfSizeKb,
        category: category || existing.category,
        author: author || existing.author,
        updated_at: new Date(),
      },
      { new: true }
    ).lean();

    emit('books', mapBook(updated));
    res.json({ success: true, data: mapBook(updated) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/books/:id', requireAdmin, async (req, res) => {
  try {
    const book = await Book.findOne({ book_id: parseInt(req.params.id) }).lean();
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });

    if (book.cover_filename) {
      const coverPath = path.join('uploads', book.cover_filename);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }
    if (book.pdf_filename) {
      const pdfPath = path.join('uploads', book.pdf_filename);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }

    const result = await Book.deleteOne({ book_id: parseInt(req.params.id) });
    await CartItem.deleteMany({ book_id: parseInt(req.params.id) });
    await Order.updateMany({}, { $pull: { items: { book_id: parseInt(req.params.id) } } });
    emit('books', { _deleted: true, id: parseInt(req.params.id) });
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Mock Payment =====
router.post('/payment/process', async (req, res) => {
  try {
    const { userId, cardNumber, expiry, cvv, cartItems, orderId } = req.body;
    const errors = validateCard(cardNumber, expiry, cvv);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join('. ') });
    }

    const token = uuidv4();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    paymentTokens.set(token, {
      userId,
      orderId,
      cartItems: cartItems || [],
      createdAt: Date.now(),
      expiresAt,
    });

    res.json({ success: true, data: { token, expiresIn: 86400 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Protected Download =====
router.get('/download/:filename', async (req, res) => {
  const token = req.query.token;
  const filename = req.params.filename;

  if (!token) {
    return res.status(403).json({ success: false, error: 'Payment required. Please complete checkout first.' });
  }

  const payment = paymentTokens.get(token);
  if (!payment) {
    return res.status(403).json({ success: false, error: 'Invalid or expired payment session.' });
  }
  if (Date.now() > payment.expiresAt) {
    paymentTokens.delete(token);
    return res.status(403).json({ success: false, error: 'Payment session has expired.' });
  }

  const filePath = path.join('uploads', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  res.download(filePath, (err) => {
    if (err) res.status(500).json({ success: false, error: err.message });
  });
});

// ===== Cart =====
router.get('/cart/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const items = await CartItem.find({ user_id: userId }).lean();
    const enriched = [];
    for (const item of items) {
      const book = await Book.findOne({ book_id: item.book_id }).lean();
      enriched.push({
        id: item.cartitem_id,
        userId: item.user_id,
        bookId: item.book_id,
        title: book?.title || 'Unknown',
        author: book?.author || '',
        description: book?.description || '',
        price: (book?.price || 0) / 100,
        coverImage: book?.cover_filename || null,
        pdfFile: book?.has_pdf ? book.pdf_filename : null,
        hasPdf: book?.has_pdf || false,
        category: book?.category || 'General',
        quantity: item.quantity,
        createdAt: item.created_at,
      });
    }
    const total = enriched.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ success: true, data: { items: enriched, total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/cart/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const { bookId, quantity = 1 } = req.body;
    const book = await Book.findOne({ book_id: bookId }).lean();
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });

    const existing = await CartItem.findOne({ user_id: userId, book_id: bookId });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
    } else {
      const lastItem = await CartItem.findOne().sort({ cartitem_id: -1 }).lean();
      const newCartId = lastItem && typeof lastItem.cartitem_id === 'number' ? lastItem.cartitem_id + 1 : 1;
      const item = new CartItem({
        cartitem_id: newCartId,
        user_id: userId,
        book_id: bookId,
        quantity,
      });
      await item.save();
    }
    emit(`cart:${userId}`, { userId, bookId, quantity });
    res.json({ success: true, message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/cart/:userId/:itemId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const itemId = parseInt(req.params.itemId);
    const result = await CartItem.deleteOne({ cartitem_id: itemId, user_id: userId });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, error: 'Item not found' });
    emit(`cart:${userId}`, { userId, itemId });
    res.json({ success: true, message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Orders =====
router.post('/orders/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const cartItemDocs = await CartItem.find({ user_id: userId }).lean();
    if (cartItemDocs.length === 0) return res.status(400).json({ success: false, error: 'Cart is empty' });

    let totalAmount = 0;
    const items = [];
    for (const cartItem of cartItemDocs) {
      const book = await Book.findOne({ book_id: cartItem.book_id }).lean();
      const price = (book?.price || 0) / 100;
      totalAmount += price * cartItem.quantity;
      items.push({
        book_id: cartItem.book_id,
        book_title: cartItem.title || book?.title || 'Unknown',
        price_paid: price,
        cover_filename: book?.cover_filename || null,
        pdf_filename: book?.has_pdf ? book.pdf_filename : null,
        quantity: cartItem.quantity,
      });
    }

    const orderCount = await Order.countDocuments();
    let newOrderId = 1;
    if (orderCount > 0) {
      const lastOrder = await Order.findOne().sort({ order_id: -1 }).lean();
      if (lastOrder && typeof lastOrder.order_id === 'number') {
        newOrderId = lastOrder.order_id + 1;
      }
    }

    const safeTotal = Math.round(totalAmount * 100) / 100;
    const order = new Order({
      order_id: newOrderId,
      user_id: userId,
      items,
      total_amount: Math.round(safeTotal * 100),
      payment_method: 'Instant Pay (Demo)',
      payment_status: 'completed',
    });
    await order.save();
    await CartItem.deleteMany({ user_id: userId });
    emit(`cart:${userId}`, { userId, orderId: newOrderId });
    emit('orders', order);

    res.status(201).json({ success: true, data: { orderId: newOrderId, totalAmount: safeTotal, status: 'completed' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/orders/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId) || 1;
    const orders = await Order.find({ user_id: userId }).sort({ order_id: -1 }).lean();
    res.json({ success: true, data: orders.map(mapOrder) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const bookCount = await Book.countDocuments();
    const orderCount = await Order.countDocuments();
    const revenueResult = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total_amount' } } }]);
    res.json({
      success: true,
      data: {
        bookCount,
        orderCount,
        revenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Realtime =====
const openEventStream = (req, res, eventName, shouldSend = () => true) => {
  res.status(200);
  res.set('Content-Type', 'text/event-stream');
  res.set('Cache-Control', 'no-cache, no-transform');
  res.set('Connection', 'keep-alive');
  res.set('X-Accel-Buffering', 'no');
  res.flushHeaders();
  res.write('retry: 2000\n\n');
  res.write(': connected\n\n');

  let closed = false;
  let heartbeat;
  let unsubscribe = () => {};
  const cleanup = () => {
    if (closed) return;
    closed = true;
    unsubscribe();
    if (heartbeat) clearInterval(heartbeat);
    try {
      res.end();
    } catch (err) {}
  };
  unsubscribe = subscribe(eventName, (data) => {
    if (closed || !shouldSend(data)) return;
    try {
      res.write(`data: ${JSON.stringify({ type: `${eventName.split(':')[0]}-update`, data })}\n\n`);
    } catch (err) {
      cleanup();
    }
  });
  heartbeat = setInterval(() => {
    if (!closed) res.write(': keep-alive\n\n');
  }, 25000);
  heartbeat.unref?.();

  req.on('close', cleanup);
  res.on('close', cleanup);
};

router.get('/realtime/books', (req, res) => {
  openEventStream(req, res, 'books');
});

router.get('/realtime/orders', (req, res) => {
  openEventStream(req, res, 'orders');
});

router.get('/realtime/orders/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  openEventStream(req, res, 'orders', (data) => data?.user_id === userId || !data?.user_id);
});

router.get('/realtime/cart/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  openEventStream(req, res, `cart:${userId}`);
});

export default router;
