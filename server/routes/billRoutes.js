const express = require('express');
const router = express.Router();
const {
    getBills,
    createBill,
    updateBill
} = require('../controllers/billController');

router.route('/').get(getBills).post(createBill);
router.route('/:id').put(updateBill).patch(updateBill);

module.exports = router;
