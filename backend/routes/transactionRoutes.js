const express = require('express');
const router = express.Router();
const {
  borrowBook,
  returnBook,
  getMyTransactions,
  getAllTransactions,
} = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/borrow', protect, borrowBook);
router.put('/:id/return', protect, returnBook);
router.get('/my', protect, getMyTransactions);
router.get('/', protect, admin, getAllTransactions);

module.exports = router;
