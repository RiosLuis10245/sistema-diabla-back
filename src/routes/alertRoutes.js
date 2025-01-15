const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Rutas de alertas requieren ser admin
router.use(verifyToken, isAdmin);

router.get('/inventory', alertController.getInventoryAlerts);
router.get('/summary', alertController.getStockSummary);

module.exports = router;