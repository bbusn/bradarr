const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings');
const { xssMiddleware } = require('../middlewares/xss');

router.get('/', settingsController.settingsView);
router.post('/', xssMiddleware, settingsController.modifySettings);

router.get('/setup', settingsController.setupView);
router.post('/setup', xssMiddleware, settingsController.setup);

router.get('/admin', settingsController.modifyAdminView);
router.post('/admin', xssMiddleware, settingsController.modifyAdmin);

router.get('/jellyseerr', settingsController.modifyJellyseerrView);
router.post('/jellyseerr', xssMiddleware, settingsController.modifyJellyseerr);

module.exports = router;