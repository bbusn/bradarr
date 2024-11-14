const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings');

router.get('/', settingsController.settingsView);

module.exports = router;