const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs');
const fetchsController = require('../controllers/fetchs');

router.get('/logs', logsController.getLogs);
router.get('/logs/latest', logsController.getLatestLogs);

router.get('/fetchs', fetchsController.getFetchs);
router.get('/fetchs/latest', fetchsController.getLatestFetchs);

module.exports = router;