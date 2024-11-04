const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController.js');
const UsersController = require('../controllers/UsersController.js');
const AuthController = require('../controllers/AuthController.js');

// Define routes and their controller methods
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

router.get('/connect', AuthController.getConnect);

router.post('/users', UsersController.postNew);

router.post('/files', FilesController.postUpload);

module.exports = router;