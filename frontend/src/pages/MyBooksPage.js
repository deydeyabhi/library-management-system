import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';

const MyBooksPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const isOverdue = (t) => t.status === 'borrowed' && new Date(t.dueDate) < new Date();

  return (
    <div>
      <h1 className="page-title">My Borrowed Books</h1>
      <p style={{ marginTop: -8, marginBottom: 16, color: 'var(--muted)', fontSize: 14 }}>
        Returns are handled at the library desk. Overdue fines update automatically each day.
      </p>
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
                <td style={{ color: t.currentFine > 0 ? 'var(--danger)' : 'inherit', fontWeight: t.currentFine > 0 ? 600 : 400 }}>
                  {t.currentFine > 0 ? `₹${t.currentFine}` : '-'}
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
