const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Todas las rutas de reportes requieren ser admin
router.use(verifyToken, isAdmin);

router.get('/daily', reportController.getDailySales);
router.get('/monthly', reportController.getMonthlySales);
router.get('/top-products', reportController.getTopProducts);

module.exports = router;