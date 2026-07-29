const Transaction = require('../models/Transaction');
const Book = require('../models/Book');

const FINE_PER_DAY = 5; // currency units per day overdue
const BORROW_DAYS = 14;

// @desc  Borrow a book
// @route POST /api/transactions/borrow
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'No copies available right now' });
    }

    const alreadyBorrowed = await Transaction.findOne({
      book: bookId,
      user: req.user._id,
      status: 'borrowed',
    });
    if (alreadyBorrowed) {
      return res.status(400).json({ message: 'You already have this book borrowed' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + BORROW_DAYS);

    const transaction = await Transaction.create({
      book: bookId,
      user: req.user._id,
      dueDate,
    });

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Return a book
// @route PUT /api/transactions/:id/return
const returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    // Only the borrower or an admin can mark it returned
    if (
      transaction.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const returnDate = new Date();
    let fine = 0;
    if (returnDate > transaction.dueDate) {
      const overdueDays = Math.ceil(
        (returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24)
      );
      fine = overdueDays * FINE_PER_DAY;
    }

    transaction.returnDate = returnDate;
    transaction.status = 'returned';
    transaction.fine = fine;
    await transaction.save();

    const book = await Book.findById(transaction.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get logged-in user's transactions
// @route GET /api/transactions/my
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('book', 'title author isbn coverImage')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all transactions (admin only)
// @route GET /api/transactions
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('book', 'title author isbn')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { borrowBook, returnBook, getMyTransactions, getAllTransactions };
