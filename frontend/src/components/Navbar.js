import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">📚 Library MS</Link>
      <div className="nav-links">
        <Link to="/">Browse Books</Link>
        {user && <Link to="/my-books">My Books</Link>}
        {user && user.role === 'admin' && <Link to="/admin/books">Manage Books</Link>}
        {user && user.role === 'admin' && <Link to="/admin/transactions">All Transactions</Link>}
        {user ? (
          <>
            <span>Hi, {user.name}</span>
            <button className="logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
