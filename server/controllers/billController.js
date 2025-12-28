const Bill = require('../models/Bill');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');

// @desc    Get all bills (optional filter by tenant)
// @route   GET /api/bills
// @access  Public
const getBills = async (req, res) => {
    try {
        const { tenantId, status } = req.query;
        let query = {};

        if (tenantId) {
            query.tenant = tenantId;
        }

        if (status) {
            query.status = status;
        }

        const bills = await Bill.find(query)
            .populate('tenant', 'name phone roomNumber')
            .sort({ createdAt: -1 });

        res.status(200).json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new monthly bill
// @route   POST /api/bills
// @access  Public
const createBill = async (req, res) => {
    try {
        const {
            tenantId,
            month,
            year,
            waterBill,
            electricityBill,
            gasBill,
            wasteBill
        } = req.body;

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            res.status(404);
            throw new Error('Tenant not found');
        }

        const rentAmount = tenant.baseRent;
        const totalAmount = rentAmount +
            (Number(waterBill) || 0) +
            (Number(electricityBill) || 0) +
            (Number(gasBill) || 0) +
            (Number(wasteBill) || 0);

        const bill = await Bill.create({
            tenant: tenantId,
            month,
            year,
            rentAmount,
            waterBill: Number(waterBill) || 0,
            electricityBill: Number(electricityBill) || 0,
            gasBill: Number(gasBill) || 0,
            wasteBill: Number(wasteBill) || 0,
            totalAmount,
            paidAmount: 0,
            dueAmount: totalAmount,
            status: 'Unpaid'
        });

        res.status(201).json(bill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update bill (e.g. mark as paid)
// @route   PUT /api/bills/:id
// @access  Public
const updateBill = async (req, res) => {
    try {
        const { paidAmount, status, paymentDate } = req.body;
        const bill = await Bill.findById(req.params.id);

        if (!bill) {
            res.status(404);
            throw new Error('Bill not found');
        }

        if (paidAmount !== undefined) {
            const newPaidAmount = parseFloat(paidAmount);
            const paidDifference = newPaidAmount - bill.paidAmount;

            if (paidDifference > 0) {
                await Payment.create({
                    tenant: bill.tenant,
                    bill: bill._id,
                    amount: paidDifference,
                    date: paymentDate || new Date()
                });
            }

            bill.paidAmount = newPaidAmount;
            bill.dueAmount = bill.totalAmount - bill.paidAmount;
        }

        if (status) {
            bill.status = status;
            if (status === 'Paid') {
                const remainingDue = bill.dueAmount;
                if (remainingDue > 0) {
                    await Payment.create({
                        tenant: bill.tenant,
                        bill: bill._id,
                        amount: remainingDue,
                        date: paymentDate || new Date()
                    });
                }
                bill.paidAmount = bill.totalAmount;
                bill.dueAmount = 0;
            }
        }

        if (paymentDate) {
            bill.paymentDate = paymentDate;
        }

        // Auto-update status if fully paid?
        if (bill.dueAmount <= 0) {
            bill.status = 'Paid';
            bill.dueAmount = 0; // Prevent negative dues
        } else if (bill.paidAmount > 0 && bill.dueAmount > 0) {
            bill.status = 'Partial';
        }

        await bill.save();
        res.status(200).json(bill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getBills,
    createBill,
    updateBill
};
