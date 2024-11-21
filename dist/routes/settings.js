const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings');

router.get('/', settingsController.settingsView);
router.post('/', settingsController.modifySettings);

router.get('/setup', settingsController.setupView);
router.post('/setup', settingsController.setup);

router.get('/admin', settingsController.modifyAdminView);
router.post('/admin', settingsController.modifyAdmin);

router.get('/jellyseerr', settingsController.modifyJellyseerrView);
router.post('/jellyseerr', settingsController.modifyJellyseerr);

module.exports = router;