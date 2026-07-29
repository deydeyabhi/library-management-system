import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';

const ManageBorrowedPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchBorrowed = useCallback(async () => {
    setLoading(true);
    try {
      // Only active loans; returned ones fall off this list.
      const { data } = await api.get('/transactions', { params: { status: 'borrowed' } });
      setTransactions(data);
    } catch (err) {
      setError('Failed to load borrowed books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBorrowed();
  }, [fetchBorrowed]);

  const isOverdue = (t) => new Date(t.dueDate) < new Date();

  const handleReturn = async (t) => {
    if (!window.confirm(`Mark "${t.book?.title}" (borrowed by ${t.user?.name}) as returned?`)) return;
    setError('');
    setMessage('');
    try {
      const { data } = await api.put(`/transactions/${t._id}/return`);
      setMessage(
        data.fine > 0
          ? `Returned. A fine of ₹${data.fine} was charged for late return.`
          : 'Returned successfully.'
      );
      fetchBorrowed();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as returned');
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Borrowed Books</h1>
      <p style={{ marginTop: -8, marginBottom: 16, color: 'var(--muted)', fontSize: 14 }}>
        Currently borrowed books. Fines shown are live and grow each day a book stays overdue.
        Marking a book returned removes it from this list.
      </p>

      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>No books are currently borrowed.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Member</th>
              <th>Borrowed On</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Fine (live)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td>{t.book?.title || 'Unknown'}</td>
                <td>{t.user?.name} ({t.user?.email})</td>
                <td>{new Date(t.borrowDate).toLocaleDateString()}</td>
                <td>{new Date(t.dueDate).toLocaleDateString()}</td>
                <td style={{ color: isOverdue(t) ? 'var(--danger)' : 'inherit', fontWeight: isOverdue(t) ? 600 : 400 }}>
                  {isOverdue(t) ? 'Overdue' : 'Borrowed'}
                </td>
                <td style={{ color: t.currentFine > 0 ? 'var(--danger)' : 'inherit', fontWeight: t.currentFine > 0 ? 600 : 400 }}>
                  {t.currentFine > 0 ? `₹${t.currentFine}` : '-'}
                </td>
                <td>
                  <button className="btn" onClick={() => handleReturn(t)}>
                    Mark Returned
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageBorrowedPage;
