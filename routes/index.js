const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController.js');
const UsersController = require('../controllers/UsersController.js');

// Define routes and their controller methods
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postUser);

module.exports = router;