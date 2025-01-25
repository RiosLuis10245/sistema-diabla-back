const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin); // Solo admin puede gestionar proveedores

router.post('/', supplierController.createSupplier);
router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.put('/:id', supplierController.updateSupplier);

module.exports = router;