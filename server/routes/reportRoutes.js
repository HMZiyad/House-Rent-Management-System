const express = require('express');
const router = express.Router();
const { getPropertyReport, getMonthlyReport } = require('../controllers/reportController');

router.get('/property', getPropertyReport);
router.get('/monthly', getMonthlyReport);

module.exports = router;
