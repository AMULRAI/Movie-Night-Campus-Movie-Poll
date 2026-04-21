const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Define routes for admin
router.post('/users/:userId/ban', adminController.banUser);
router.post('/flags/:flagId/resolve', adminController.resolveFlag);

module.exports = router;
