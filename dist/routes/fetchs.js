const express = require('express');
const router = express.Router();
const fetchsController = require('../controllers/fetchs');

router.get('/', fetchsController.fetchsView);

module.exports = router;