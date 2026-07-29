import React, { useState, useEffect } from 'react';

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
  description: '',
  totalCopies: 1,
  coverImage: '',
};

const BookFormModal = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        author: initialData.author || '',
        isbn: initialData.isbn || '',
        genre: initialData.genre || '',
        description: initialData.description || '',
        totalCopies: initialData.totalCopies || 1,
        coverImage: initialData.coverImage || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, totalCopies: Number(form.totalCopies) });
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      }}
    >
      <div className="card" style={{ width: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>{initialData ? 'Edit Book' : 'Add New Book'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Author *</label>
            <input name="author" value={form.author} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>ISBN *</label>
            <input name="isbn" value={form.isbn} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Genre</label>
            <input name="genre" value={form.genre} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Total Copies *</label>
            <input type="number" min="0" name="totalCopies" value={form.totalCopies} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Cover Image URL</label>
            <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="https://..." />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn">{initialData ? 'Save Changes' : 'Add Book'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookFormModal;
