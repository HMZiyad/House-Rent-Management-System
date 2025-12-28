const express = require('express');
const router = express.Router();
const { sendInvoice, sendReceipt } = require('../controllers/notificationController');

router.post('/send-invoice', sendInvoice);
router.post('/send-receipt', sendReceipt);

module.exports = router;
