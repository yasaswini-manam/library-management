import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../services/api';
import { Search, Plus, Trash2, BookCheck, BookX, Library } from 'lucide-react';

const Books = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'available' | 'issued'

  // Add Book Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '' });
  const [isbnError, setIsbnError] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/api/books');
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      alert('Failed to load books: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      return loadBooks();
    }
    try {
      setLoading(true);
      const data = await fetchWithAuth(`/api/books/search?keyword=${encodeURIComponent(searchTerm)}`);
      setBooks(data);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateIsbn = (isbn) => {
    const clean = isbn.replace(/[-\s]/g, '');
    if (clean.length === 10 || clean.length === 13) {
      if (/^[0-9]+$/.test(clean)) return clean;
    }
    return null;
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setIsbnError('');

    const cleanIsbn = validateIsbn(newBook.isbn);
    if (!cleanIsbn) {
      setIsbnError('ISBN must be exactly 10 or 13 digits (numbers only)');
      return;
    }

    try {
      await fetchWithAuth('/api/books', {
        method: 'POST',
        body: JSON.stringify({ ...newBook, isbn: cleanIsbn })
      });
      setNewBook({ title: '', author: '', isbn: '' });
      setIsbnError('');
      setShowAddForm(false);
      loadBooks();
    } catch (error) {
      alert('Failed to add book: ' + error.message);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await fetchWithAuth(`/api/books/${bookId}`, { method: 'DELETE' });
      loadBooks();
    } catch (error) {
      alert('Failed to delete book: ' + error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Book Catalog</h1>
        {user.isLibrarian && (
          <button onClick={() => { setShowAddForm(!showAddForm); setIsbnError(''); }}>
            <Plus size={20} />
            <span>{showAddForm ? 'Cancel' : 'Add Book'}</span>
          </button>
        )}
      </div>

      {showAddForm && user.isLibrarian && (
        <div className="glass-panel mb-6">
          <h3 className="mb-4">Add New Book</h3>
          <form onSubmit={handleAddBook}>
            <div className="flex gap-4 items-start" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label>Title *</label>
                <input
                  placeholder="e.g. Clean Code"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label>Author *</label>
                <input
                  placeholder="e.g. Robert C. Martin"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label>ISBN * <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)' }}>(10 or 13 digits)</span></label>
                <input
                  placeholder="e.g. 9780132350884"
                  value={newBook.isbn}
                  onChange={(e) => { setNewBook({ ...newBook, isbn: e.target.value }); setIsbnError(''); }}
                  required
                  style={{ borderColor: isbnError ? '#ef4444' : '' }}
                />
                {isbnError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{isbnError}</p>}
              </div>
              <div style={{ paddingTop: '24px' }}>
                <button type="submit">Save Book</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all',       label: 'All Books',  icon: <Library   size={16} />, count: books.length },
          { key: 'available', label: 'Available',  icon: <BookCheck size={16} />, count: books.filter(b => b.available).length },
          { key: 'issued',    label: 'Issued',     icon: <BookX     size={16} />, count: books.filter(b => !b.available).length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '999px',
              border: '2px solid',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              borderColor:
                tab.key === 'available' ? '#10b981' :
                tab.key === 'issued'    ? '#ef4444' : 'var(--surface-border, #444)',
              background: filter === tab.key
                ? (tab.key === 'available' ? 'rgba(16,185,129,0.18)'
                   : tab.key === 'issued'  ? 'rgba(239,68,68,0.18)'
                   : 'rgba(255,255,255,0.10)')
                : 'transparent',
              color:
                filter === tab.key
                  ? (tab.key === 'available' ? '#10b981'
                     : tab.key === 'issued'  ? '#ef4444'
                     : 'inherit')
                  : 'var(--text-muted, #999)',
            }}
          >
            {tab.icon}
            {tab.label}
            <span style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '999px',
              padding: '1px 8px',
              fontSize: '0.78rem',
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="glass-panel mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1" style={{ position: 'relative' }}>
            <Search size={20} className="text-muted" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button type="submit" className="secondary">Search</button>
          {searchTerm && (
            <button type="button" className="secondary" onClick={() => { setSearchTerm(''); loadBooks(); }}>
              Clear
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <p>Loading books...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {(() => {
            const filtered = books.filter(b =>
              filter === 'available' ? b.available :
              filter === 'issued'    ? !b.available :
              true
            );
            return filtered.length === 0 ? (
              <p className="text-muted">No {filter !== 'all' ? filter : ''} books found.</p>
            ) : (
            filtered.map(book => (
              <div
                key={book.bookId}
                className="glass-card flex flex-col justify-between"
                style={{
                  borderLeft: book.available
                    ? '3px solid #10b981'
                    : '3px solid #ef4444'
                }}
              >
                <div>
                  {/* Status icon banner */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: book.available
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(239, 68, 68, 0.12)',
                  }}>
                    {book.available ? (
                      <BookCheck size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                    ) : (
                      <BookX size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                    )}
                    <span style={{
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: book.available ? '#10b981' : '#ef4444'
                    }}>
                      {book.available ? 'Available' : 'Currently Issued'}
                    </span>
                  </div>

                  <h3 className="m-0" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{book.title}</h3>
                  <p className="text-muted mb-2">by {book.author}</p>
                  {book.isbn && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ISBN: {book.isbn}</p>}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {book.bookId}</p>
                </div>

                {user.isLibrarian && (
                  <div className="flex justify-end gap-2 mt-4 border-t border-surface-border pt-4">
                    <button className="secondary" onClick={() => handleDelete(book.bookId)} style={{ padding: '8px' }} title="Delete">
                      <Trash2 size={16} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                )}
              </div>
            ))
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Books;
