const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/low-stock', verifyToken, notificationController.getLowStockAlerts);

module.exports = router;