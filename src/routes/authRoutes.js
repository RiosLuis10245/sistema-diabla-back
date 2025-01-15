const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/init-admin', authController.initializeAdmin);
router.post('/register', verifyToken, isAdmin, authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;