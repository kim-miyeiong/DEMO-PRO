import Book from './database/models/Book.js';
import { v4 as uuidv4 } from 'uuid';

const books = [
  { book_id: 101, title: 'The Art of Code', description: 'A comprehensive guide to writing elegant, maintainable code.', price: 2999, author: 'Jane Developer', category: 'Technology', cover_filename: null, has_pdf: false, pdf_filename: null, pdf_size_kb: 0 },
  { book_id: 102, title: 'Design Systems', description: 'Learn how to build and scale design systems from scratch.', price: 2499, author: 'Alice Designer', category: 'Art', cover_filename: null, has_pdf: false, pdf_filename: null, pdf_size_kb: 0 },
  { book_id: 103, title: 'Data Science Fundamentals', description: 'Master core concepts of data science and machine learning.', price: 3499, author: 'Bob Analyst', category: 'Science', cover_filename: null, has_pdf: false, pdf_filename: null, pdf_size_kb: 0 },
  { book_id: 104, title: 'Business Strategy 101', description: 'Essential frameworks for building a successful business.', price: 1999, author: 'Carol CEO', category: 'Business', cover_filename: null, has_pdf: false, pdf_filename: null, pdf_size_kb: 0 },
  { book_id: 105, title: 'Modern JavaScript', description: 'Deep dive into modern JavaScript features and patterns.', price: 2799, author: 'Dave Coder', category: 'Technology', cover_filename: null, has_pdf: false, pdf_filename: null, pdf_size_kb: 0 },
  { book_id: 106, title: 'The Mindful Journey', description: 'Self-help guide to finding balance through mindfulness.', price: 1499, author: 'Eve Author', category: 'Self-Help', cover_filename: null, has_pdf: false, pdf_filename: null, pdf_size_kb: 0 },
];

const seed = async () => {
  const count = await Book.countDocuments();
  if (count > 0) {
    console.log('Already seeded, skipping.');
    return;
  }
  const booksWithCovers = books.map(b => ({
    ...b,
    cover_filename: `https://covers.openlibrary.org/b/title/${encodeURIComponent(b.title.replace(/\s+/g, '+'))}-M.jpg`,
  }));
  await Book.insertMany(booksWithCovers);
  console.log(`Seeded ${booksWithCovers.length} books`);
};

export default seed;
