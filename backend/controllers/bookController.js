const Book = require('../models/Book');

// @desc  Get all books (with optional search & pagination)
// @route GET /api/books
const getBooks = async (req, res) => {
  try {
    const { search, genre, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }
    if (genre) {
      query.genre = genre;
    }

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const count = await Book.countDocuments(query);

    res.json({ books, total: count, page: Number(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single book
// @route GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create a book (admin only)
// @route POST /api/books
const createBook = async (req, res) => {
  try {
    const { title, author, isbn, genre, description, totalCopies, coverImage } = req.body;

    if (!title || !author || !isbn || !totalCopies) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const bookExists = await Book.findOne({ isbn });
    if (bookExists) {
      return res.status(400).json({ message: 'A book with this ISBN already exists' });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      genre,
      description,
      totalCopies,
      availableCopies: totalCopies,
      coverImage,
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update a book (admin only)
// @route PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const { title, author, isbn, genre, description, totalCopies, coverImage } = req.body;

    // If totalCopies changes, adjust availableCopies proportionally
    if (totalCopies !== undefined && totalCopies !== book.totalCopies) {
      const diff = totalCopies - book.totalCopies;
      book.availableCopies = Math.max(0, book.availableCopies + diff);
      book.totalCopies = totalCopies;
    }

    book.title = title ?? book.title;
    book.author = author ?? book.author;
    book.isbn = isbn ?? book.isbn;
    book.genre = genre ?? book.genre;
    book.description = description ?? book.description;
    book.coverImage = coverImage ?? book.coverImage;

    const updated = await book.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete a book (admin only)
// @route DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    await book.deleteOne();
    res.json({ message: 'Book removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
