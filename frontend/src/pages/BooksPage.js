import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchBooks = useCallback(async (searchTerm = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/books', { params: { search: searchTerm, limit: 50 } });
      setBooks(data.books);
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  const handleBorrow = async (bookId) => {
    setMessage('');
    setError('');
    try {
      await api.post('/transactions/borrow', { bookId });
      setMessage('Book borrowed successfully! Check "My Books" for due date.');
      fetchBooks(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to borrow book');
    }
  };

  return (
    <div>
      <div className="top-row">
        <h1 className="page-title">Browse Books</h1>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn" type="submit">Search</button>
      </form>

      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <p>Loading books...</p>
      ) : books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <div className="grid">
          {books.map((book) => (
            <div className="book-card" key={book._id}>
              <h3>{book.title}</h3>
              <p>by {book.author}</p>
              <p>{book.genre}</p>
              <span className={`badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Out of stock'}
              </span>
              {user && user.role === 'admin' ? (
                <Link className="btn secondary" to={`/admin/books/${book._id}`}>
                  Details
                </Link>
              ) : user ? (
                <button
                  className="btn"
                  disabled={book.availableCopies < 1}
                  onClick={() => handleBorrow(book._id)}
                >
                  Borrow
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BooksPage;
