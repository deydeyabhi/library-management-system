import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const changeRole = async (id, role, name) => {
    const verb = role === 'admin' ? 'promote' : 'demote';
    if (!window.confirm(`Are you sure you want to ${verb} ${name} to ${role}?`)) return;
    setError('');
    setMessage('');
    try {
      await api.put(`/auth/users/${id}/role`, { role });
      setMessage(`${name} is now ${role}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Users</h1>
      <p style={{ marginTop: -8, marginBottom: 16, color: '#666', fontSize: 14 }}>
        Promote a member to admin, or demote an admin back to member.
      </p>

      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = currentUser && u._id === currentUser._id;
              return (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    {isSelf ? (
                      <span style={{ color: '#999' }}>You</span>
                    ) : u.role === 'admin' ? (
                      <button className="btn secondary" onClick={() => changeRole(u._id, 'member', u.name)}>
                        Demote to member
                      </button>
                    ) : (
                      <button className="btn" onClick={() => changeRole(u._id, 'admin', u.name)}>
                        Promote to admin
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsersPage;
