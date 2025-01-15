const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { verifyToken, isAdmin, isSeller } = require('../middleware/auth');

// Rutas de vendedor
router.post('/', verifyToken, isSeller, saleController.createSale);
router.get('/detail/:id', verifyToken, isSeller, saleController.getSaleById);

// Rutas de admin
router.get('/', verifyToken, isAdmin, saleController.getAllSales);
router.get('/:id/invoice', verifyToken, isAdmin, saleController.generateInvoice);
router.post('/:id/cancel', verifyToken, isAdmin, saleController.cancelSale);
module.exports = router;