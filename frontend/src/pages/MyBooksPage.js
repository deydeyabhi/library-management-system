import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';

const MyBooksPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions/my');
      setTransactions(data);
    } catch (err) {
      setError('Failed to load your transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleReturn = async (id) => {
    setMessage('');
    setError('');
    try {
      const { data } = await api.put(`/transactions/${id}/return`);
      if (data.fine > 0) {
        setMessage(`Book returned. A fine of ${data.fine} was applied for late return.`);
      } else {
        setMessage('Book returned successfully!');
      }
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return book');
    }
  };

  const isOverdue = (t) => t.status === 'borrowed' && new Date(t.dueDate) < new Date();

  return (
    <div>
      <h1 className="page-title">My Borrowed Books</h1>
      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>You haven't borrowed any books yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Borrowed On</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Fine</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td>{t.book?.title || 'Unknown book'}</td>
                <td>{new Date(t.borrowDate).toLocaleDateString()}</td>
                <td>{new Date(t.dueDate).toLocaleDateString()}</td>
                <td>
                  {t.status === 'returned'
                    ? 'Returned'
                    : isOverdue(t)
                    ? 'Overdue'
                    : 'Borrowed'}
                </td>
                <td>{t.fine > 0 ? t.fine : '-'}</td>
                <td>
                  {t.status !== 'returned' && (
                    <button className="btn secondary" onClick={() => handleReturn(t._id)}>
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyBooksPage;
