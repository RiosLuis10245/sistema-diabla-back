const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin, isSeller } = require('../middleware/auth');

// Rutas públicas (requieren solo token)
router.get('/', verifyToken, productController.getAllProducts);
router.get('/search', verifyToken, productController.searchProducts);
router.get('/:id', verifyToken, productController.getProductById);

// Rutas que requieren ser admin
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.put('/:id', verifyToken, isAdmin, productController.updateProduct);
router.get('/barcode/:code', verifyToken, isSeller, productController.getProductByBarcode);
module.exports = router;