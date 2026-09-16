import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooks } from '../hooks/useBooks.js';
import BookCard from '../components/BookCard.jsx';
import { Search, TrendingUp, Sparkles, Clock, BookOpen, LayoutGrid, List } from 'lucide-react';

const genreColors = [
  'from-blue-500 to-indigo-600',
  'from-orange-500 to-red-500',
  'from-green-500 to-emerald-600',
  'from-purple-500 to-violet-600',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-cyan-600',
  'from-amber-500 to-orange-600',
  'from-red-500 to-pink-600',
  'from-indigo-500 to-blue-600',
  'from-emerald-500 to-teal-600',
];

function getGenreColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return genreColors[Math.abs(hash) % genreColors.length];
}

export default function Home({ userId }) {
  const { books, loading, error } = useBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const categories = useMemo(() =>
    [...new Set(books.map(b => b.category).filter(Boolean))].sort(),
    [books]
  );

  const filteredBooks = selectedCategory
    ? books.filter(b => b.category === selectedCategory)
    : books;

  const searchedBooks = searchQuery
    ? filteredBooks.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredBooks;

  const featured = searchedBooks.slice(0, 3);
  const rest = searchedBooks.slice(3);

  const booksByCategory = useMemo(() => {
    const map = {};
    searchedBooks.forEach(b => {
      const cat = b.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(b);
    });
    return map;
  }, [searchedBooks]);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/uploads/photography-of-shelves-of-books.jpg"
            alt="Books"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-orange-300" />
              <span className="text-sm text-white/90">Curated for curious minds</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black font-display text-white leading-[1.1] mb-6 drop-shadow-lg"
            >
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-300">Amazing</span><br />Books
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed"
            >
              Browse, collect, and download books from our curated collection.<br className="hidden md:block" />
              Upload your own and share with the world.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative max-w-xl mx-auto"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
              <input
                type="text"
                placeholder="Search by title, author, or category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/30 text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all text-base shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {books.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-wrap justify-center gap-8 md:gap-16"
          >
            <div className="text-center">
              <div className="text-3xl font-bold font-display text-slate-800">{books.length}</div>
              <div className="text-sm text-gray-500 mt-1">Total Books</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-display text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-500 mt-1">Genres</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-display text-orange-500">{featured.length}</div>
              <div className="text-sm text-gray-500 mt-1">Featured</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-display text-red-500">
                <TrendingUp className="w-7 h-7 inline -mt-1" />
              </div>
              <div className="text-sm text-gray-500 mt-1">Trending</div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Genre Cards */}
      {categories.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              Browse by Genre
            </h2>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat, i) => {
              const count = books.filter(b => b.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => {
                    setSelectedCategory(isSelected ? '' : cat);
                    setSearchQuery('');
                  }}
                  className={`relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 group ${
                    isSelected
                      ? 'ring-2 ring-blue-500 ring-offset-2 shadow-md'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${getGenreColor(cat)} opacity-100`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-sm">{cat}</span>
                      <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                    <BookOpen className="w-8 h-8 text-white/40 mt-2 group-hover:text-white/60 transition-colors" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Genre Books Sections */}
      {selectedCategory && booksByCategory[selectedCategory]?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold font-display bg-gradient-to-r ${getGenreColor(selectedCategory)} bg-clip-text text-transparent`}>
              {selectedCategory}
            </h2>
            <button
              onClick={() => setSelectedCategory('')}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear filter
            </button>
          </div>
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {booksByCategory[selectedCategory].map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter Pills */}
      {categories.length > 0 && !selectedCategory && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-500">Quick filter</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Books */}
      {featured.length > 0 && !selectedCategory && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Featured Books
            </h2>
            <span className="text-sm text-gray-500">Hand-picked for you</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((book, i) => (
              <div key={book.id} className={i === 0 ? 'md:col-span-1' : ''}>
                <BookCard book={book} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Books */}
      {!selectedCategory && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display text-slate-800">All Books</h2>
            <span className="text-sm text-gray-500">{searchedBooks.length} books</span>
          </div>
          {rest.length > 0 ? (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {rest.map((book, i) => (
                <BookCard key={book.id} book={book} index={i + featured.length} />
              ))}
            </div>
          ) : searchedBooks.length === 0 && !loading ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No books found</h3>
              <p className="text-gray-500 mb-4">No results for &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
                className="px-6 py-3 btn-primary rounded-xl"
              >
                Clear Search
              </button>
            </div>
          ) : null}
        </section>
      )}

      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="h-52 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 shimmer rounded" />
                  <div className="h-4 w-full shimmer rounded" />
                  <div className="h-8 w-1/3 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Unable to load books</h3>
          <p className="text-gray-500 mb-4">{error}</p>
        </div>
      )}
    </motion.div>
  );
}
