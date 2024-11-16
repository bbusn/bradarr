const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/login', authController.loginView);
router.post('/login', authController.login);

router.get('/logout', authController.getLogout);

module.exports = router;