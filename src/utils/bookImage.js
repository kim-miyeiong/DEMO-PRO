export function getBookCoverUrl(bookOrTitle) {
  const book = typeof bookOrTitle === 'object' && bookOrTitle !== null ? bookOrTitle : null;
  const title = book ? book.title : bookOrTitle;
  if (book?.coverImage) return `/uploads/${encodeURIComponent(book.coverImage)}`;
  if (!title) return '';
  const encoded = encodeURIComponent(title.trim().replace(/\s+/g, ' '));
  return `https://covers.openlibrary.org/b/title/${encoded}-M.jpg`;
}

export function getBookCoverFallback(title) {
  if (!title) return '';
  const seed = encodeURIComponent(title.trim().replace(/\s+/g, '-'));
  return `https://picsum.photos/seed/${seed}/400/600`;
}

export function getMockCover(title, author) {
  if (!title) return '';
  const titleText = title.length > 18 ? title.substring(0, 16) + '..' : title;
  const authorText = author && author.length > 14 ? author.substring(0, 12) + '..' : author || '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:%232563eb;stop-opacity:1" />
        <stop offset="100%" style="stop-color:%231d4ed8;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#g)" rx="8"/>
    <rect x="20" y="20" width="360" height="560" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" rx="4"/>
    <text x="200" y="280" font-family="Georgia,serif" font-size="28" fill="white" text-anchor="middle" font-weight="bold">${titleText}</text>
    ${authorText ? `<text x="200" y="320" font-family="Inter,sans-serif" font-size="16" fill="rgba(255,255,255,0.7)" text-anchor="middle">${authorText}</text>` : ''}
    <text x="200" y="400" font-family="Inter,sans-serif" font-size="12" fill="rgba(255,255,255,0.4)" text-anchor="middle" letter-spacing="4">BOOKVERSE</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function handleImageError(e, title, author) {
  const fallback = getBookCoverFallback(title);
  if (fallback && e.target.src !== fallback) {
    e.target.src = fallback;
  } else {
    e.target.src = getMockCover(title, author);
  }
}
