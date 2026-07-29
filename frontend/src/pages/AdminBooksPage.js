import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import BookFormModal from '../components/BookFormModal';

const AdminBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/books', { params: { limit: 100 } });
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

  const openAddModal = () => {
    setEditingBook(null);
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    setError('');
    setMessage('');
    try {
      if (editingBook) {
        await api.put(`/books/${editingBook._id}`, formData);
        setMessage('Book updated successfully');
      } else {
        await api.post('/books', formData);
        setMessage('Book added successfully');
      }
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save book');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/books/${id}`);
      setMessage('Book deleted');
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete book');
    }
  };

  return (
    <div>
      <div className="top-row">
        <h1 className="page-title">Manage Books</h1>
        <button className="btn" onClick={openAddModal}>+ Add Book</button>
      </div>

      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Total</th>
              <th>Available</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.isbn}</td>
                <td>{book.totalCopies}</td>
                <td>{book.availableCopies}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn secondary" onClick={() => openEditModal(book)}>Edit</button>
                  <button className="btn danger" onClick={() => handleDelete(book._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <BookFormModal
          initialData={editingBook}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AdminBooksPage;
