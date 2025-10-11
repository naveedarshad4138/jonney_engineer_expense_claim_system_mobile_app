const express = require('express');
const router = express.Router();
const expenseClaimController  = require('../controllers/expenseClaimController');

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
// Route with auth + multer upload
router.post(
  '/expense-claims',
  auth, // 'receipts' must match key in Postman/form-data
  expenseClaimController.createExpenseClaim
);
router.get('/', auth, expenseClaimController.getExpenseClaim);
// router.post('/add', auth, authController.addForm);
// router.post('/history-results', auth, authController.updateHistoryResults);
router.get('/expense/:id',adminAuth, expenseClaimController.getExpenseClaimById);
router.post('/expense/cancel/:id',adminAuth, expenseClaimController.cancelExpenseClaimById);
// router.put('/:id', auth, authController.editForm);
router.get('/all', adminAuth, expenseClaimController.getAllExpenseHistory);
router.delete('/:id', adminAuth, expenseClaimController.deleteExpenseClaimById); 


module.exports = router;    