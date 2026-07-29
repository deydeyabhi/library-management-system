import React, { useEffect, useState } from 'react';
import api from '../api/api';

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await api.get('/transactions');
        setTransactions(data);
      } catch (err) {
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const isOverdue = (t) => t.status === 'borrowed' && new Date(t.dueDate) < new Date();

  return (
    <div>
      <h1 className="page-title">All Transactions</h1>
      {error && <div className="error-msg">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Member</th>
              <th>Borrowed On</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td>{t.book?.title || 'Unknown'}</td>
                <td>{t.user?.name} ({t.user?.email})</td>
                <td>{new Date(t.borrowDate).toLocaleDateString()}</td>
                <td>{new Date(t.dueDate).toLocaleDateString()}</td>
                <td>
                  {t.status === 'returned' ? 'Returned' : isOverdue(t) ? 'Overdue' : 'Borrowed'}
                </td>
                <td>{t.fine > 0 ? t.fine : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTransactionsPage;
