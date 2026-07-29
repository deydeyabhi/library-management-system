const express = require('express');
const router = express.Router();
const {
  borrowBook,
  returnBook,
  getMyTransactions,
  getAllTransactions,
  getBookTransactions,
} = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/borrow', protect, borrowBook);
router.put('/:id/return', protect, admin, returnBook); // returns are admin-only now
router.get('/my', protect, getMyTransactions);
router.get('/', protect, admin, getAllTransactions);
router.get('/book/:bookId', protect, admin, getBookTransactions);

module.exports = router;
