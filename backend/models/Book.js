const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    genre: { type: String, trim: true, default: 'General' },
    description: { type: String, default: '' },
    totalCopies: { type: Number, required: true, min: 0, default: 1 },
    availableCopies: { type: Number, required: true, min: 0, default: 1 },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
