import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BooksPage from './pages/BooksPage';
import MyBooksPage from './pages/MyBooksPage';
import BookDetailPage from './pages/BookDetailPage';
import ManageBorrowedPage from './pages/ManageBorrowedPage';
import AdminBooksPage from './pages/AdminBooksPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminUsersPage from './pages/AdminUsersPage';

function App() {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  return (
    <div className={isAdmin ? 'admin-theme' : undefined}>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<BooksPage />} />
          <Route
            path="/my-books"
            element={
              <PrivateRoute>
                <MyBooksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <AdminRoute>
                <AdminBooksPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/books/:id"
            element={
              <AdminRoute>
                <BookDetailPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/borrowed"
            element={
              <AdminRoute>
                <ManageBorrowedPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <AdminRoute>
                <AdminTransactionsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
