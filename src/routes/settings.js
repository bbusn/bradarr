const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings');

router.get('/', settingsController.settingsView);

router.get('/setup', settingsController.setupView);

module.exports = router;