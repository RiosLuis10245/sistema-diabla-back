const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin); // Solo admin puede gestionar compras

router.post('/', purchaseController.createPurchase);
router.get('/', purchaseController.getAllPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/:id/cancel', verifyToken, isAdmin, purchaseController.cancelPurchase);
module.exports = router;