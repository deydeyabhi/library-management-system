const Transaction = require('../models/Transaction');
const Book = require('../models/Book');

const FINE_PER_DAY = 5; // currency units per day overdue
const BORROW_DAYS = 14;

// Live fine for a transaction as of right now.
// - returned: the fine that was locked in at return time
// - still borrowed & past due: accrues FINE_PER_DAY for each day overdue
// - otherwise: 0
const computeCurrentFine = (t) => {
  if (t.status === 'returned') return t.fine || 0;
  const due = new Date(t.dueDate);
  const now = new Date();
  if (now <= due) return 0;
  const overdueDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
  return overdueDays * FINE_PER_DAY;
};

// @desc  Borrow a book
// @route POST /api/transactions/borrow
const borrowBook = async (req, res) => {
  try {
    // Admins manage the library; they don't borrow from it.
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot borrow books' });
    }

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

// @desc  Mark a book as returned (admin only)
// @route PUT /api/transactions/:id/return
// @access Admin
const returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
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

// @desc  Get logged-in user's transactions (with live fine)
// @route GET /api/transactions/my
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('book', 'title author isbn coverImage')
      .sort({ createdAt: -1 })
      .lean();
    res.json(transactions.map((t) => ({ ...t, currentFine: computeCurrentFine(t) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all transactions (admin only). Optional ?status=borrowed filter.
// @route GET /api/transactions
// @access Admin
const getAllTransactions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const transactions = await Transaction.find(filter)
      .populate('book', 'title author isbn')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(transactions.map((t) => ({ ...t, currentFine: computeCurrentFine(t) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get active (currently borrowed) transactions for a single book (admin only)
// @route GET /api/transactions/book/:bookId
// @access Admin
const getBookTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      book: req.params.bookId,
      status: 'borrowed',
    })
      .populate('user', 'name email')
      .sort({ borrowDate: -1 })
      .lean();
    res.json(transactions.map((t) => ({ ...t, currentFine: computeCurrentFine(t) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getMyTransactions,
  getAllTransactions,
  getBookTransactions,
};
