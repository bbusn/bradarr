const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home');

router.get('/', homeController.homeView);

module.exports = router;