const express = require('express');
const router = express.Router();
const expenseClaimController  = require('../controllers/expenseClaimController');

const auth = require('../middleware/auth');

// Route with auth + multer upload
router.post(
  '/expense-claims',
  auth, // 'receipts' must match key in Postman/form-data
  expenseClaimController.createExpenseClaim
);
router.get('/', auth, expenseClaimController.getExpenseClaim);
// router.post('/add', auth, authController.addForm);
// router.post('/history-results', auth, authController.updateHistoryResults);
// router.get('/history-results/:form_id', authController.getHistoryByFormId);
// router.put('/:id', auth, authController.editForm);
// router.get('/all', adminAuth, authController.getAllFormHistory);
// router.delete('/:id', auth, authController.deleteForm);


module.exports = router;    