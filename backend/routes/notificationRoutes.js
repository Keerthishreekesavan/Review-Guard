const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyNotifications, markAsRead, markOneAsRead, clearAll } = require('../controllers/notificationController');

router.get('/', protect, getMyNotifications);
router.put('/mark-as-read', protect, markAsRead);
router.patch('/:id/read', protect, markOneAsRead);
router.delete('/clear-all', protect, clearAll);

module.exports = router;
