import mongoose, { Schema } from 'mongoose';

const BookSchema = new Schema({
  book_id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  cover_filename: { type: String, default: null },
  pdf_filename: { type: String, default: null },
  has_pdf: { type: Boolean, default: false },
  pdf_size_kb: { type: Number, default: 0 },
  author: { type: String, default: '' },
  category: { type: String, default: 'General' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { collection: 'books' });

const Book = mongoose.model('Book', BookSchema);
export default Book;
