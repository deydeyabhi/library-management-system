import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import BookFormModal from '../components/BookFormModal';

const BookDetailPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookRes, txnRes] = await Promise.all([
        api.get(`/books/${id}`),
        api.get(`/transactions/book/${id}`),
      ]);
      setBook(bookRes.data);
      setBorrowers(txnRes.data);
    } catch (err) {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/books/${id}`, formData);
      setMessage('Book updated successfully');
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update book');
    }
  };

  const isOverdue = (t) => new Date(t.dueDate) < new Date();

  if (loading) return <p>Loading...</p>;
  if (!book) return <div className="error-msg">{error || 'Book not found'}</div>;

  const borrowedCount = book.totalCopies - book.availableCopies;

  return (
    <div>
      <Link to="/admin/books" style={{ color: 'var(--muted)', fontSize: 14 }}>← Back to Manage Books</Link>

      <div className="top-row" style={{ marginTop: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{book.title}</h1>
        <button className="btn" onClick={() => setShowModal(true)}>Edit Book</button>
      </div>

      {message && <div className="success-msg" style={{ marginTop: 16 }}>{message}</div>}
      {error && <div className="error-msg" style={{ marginTop: 16 }}>{error}</div>}

      <div className="card" style={{ marginTop: 16, display: 'flex', gap: 20 }}>
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            style={{ width: 120, height: 'auto', borderRadius: 8, objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 20px', alignSelf: 'start' }}>
          <strong>Author</strong><span>{book.author}</span>
          <strong>ISBN</strong><span>{book.isbn}</span>
          <strong>Genre</strong><span>{book.genre || '-'}</span>
          <strong>Total copies</strong><span>{book.totalCopies}</span>
          <strong>Available</strong><span>{book.availableCopies}</span>
          <strong>Borrowed out</strong><span>{borrowedCount}</span>
          <strong>Description</strong><span>{book.description || '-'}</span>
        </div>
      </div>

      <h2 style={{ marginTop: 28, fontSize: 20 }}>Currently Borrowed By</h2>
      {borrowers.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No copies are currently borrowed.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Borrowed On</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Fine (live)</th>
            </tr>
          </thead>
          <tbody>
            {borrowers.map((t) => (
              <tr key={t._id}>
                <td>{t.user?.name}</td>
                <td>{t.user?.email}</td>
                <td>{new Date(t.borrowDate).toLocaleDateString()}</td>
                <td>{new Date(t.dueDate).toLocaleDateString()}</td>
                <td style={{ color: isOverdue(t) ? 'var(--danger)' : 'inherit', fontWeight: isOverdue(t) ? 600 : 400 }}>
                  {isOverdue(t) ? 'Overdue' : 'Borrowed'}
                </td>
                <td style={{ color: t.currentFine > 0 ? 'var(--danger)' : 'inherit', fontWeight: t.currentFine > 0 ? 600 : 400 }}>
                  {t.currentFine > 0 ? `₹${t.currentFine}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <BookFormModal
          initialData={book}
          onSubmit={handleSave}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default BookDetailPage;
