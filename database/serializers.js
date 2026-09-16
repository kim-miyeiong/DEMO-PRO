const mapBook = (book) => ({
  id: book.book_id,
  title: book.title,
  description: book.description,
  price: book.price / 100,
  coverImage: book.cover_filename || null,
  pdfFile: book.has_pdf ? book.pdf_filename : null,
  fileType: book.has_pdf ? 'pdf' : 'image',
  category: book.category || 'General',
  author: book.author || '',
  createdAt: book.created_at,
  updatedAt: book.updated_at,
});

const mapOrder = (order) => ({
  id: order.order_id,
  orderId: order.order_id,
  userId: order.user_id,
  items: (order.items || []).map((item) => ({
    id: item.book_id,
    bookId: item.book_id,
    title: item.book_title,
    price: item.price_paid,
    coverImage: item.cover_filename || null,
    pdfFile: item.pdf_filename || null,
    quantity: item.quantity,
  })),
  totalAmount: order.total_amount / 100,
  status: order.payment_status,
  paymentMethod: order.payment_method,
  createdAt: order.created_at,
});

export { mapBook, mapOrder };
