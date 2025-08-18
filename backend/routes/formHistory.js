const express = require('express');
const router = express.Router();
const authController = require('../controllers/formHistoryController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.post('/add', auth, authController.addForm);
router.post('/history-results', auth, authController.updateHistoryResults);
router.get('/history-results/:form_id', authController.getHistoryByFormId);
router.get('/', auth, authController.getFormHistory);
router.put('/:id', auth, authController.editForm);
router.get('/all', adminAuth, authController.getAllFormHistory);
router.delete('/:id', auth, authController.deleteForm);


module.exports = router;    