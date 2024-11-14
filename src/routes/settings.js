const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings');
const { xssMiddleware } = require('../middlewares/xss');

router.get('/', settingsController.settingsView);


router.get('/setup', settingsController.setupView);
router.post('/setup', xssMiddleware, settingsController.setup);

module.exports = router;