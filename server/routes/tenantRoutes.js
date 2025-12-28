const express = require('express');
const router = express.Router();
const {
    getTenants,
    getTenant,
    addTenant,
    updateTenant,
    deleteTenant,
    recordPayment
} = require('../controllers/tenantController');

router.route('/').get(getTenants).post(addTenant);
router.route('/:id').get(getTenant).put(updateTenant).delete(deleteTenant);
router.route('/:id/pay').post(recordPayment);

module.exports = router;
