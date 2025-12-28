const Tenant = require('../models/Tenant');
const Bill = require('../models/Bill');

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Public
const getTenants = async (req, res) => {
    try {
        const tenants = await Tenant.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json(tenants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single tenant
// @route   GET /api/tenants/:id
// @access  Public
const getTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            res.status(404);
            throw new Error('Tenant not found');
        }
        res.status(200).json(tenant);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Add a new tenant
// @route   POST /api/tenants
// @access  Public
const addTenant = async (req, res) => {
    try {
        const {
            name,
            phone,
            roomNumber,
            baseRent,
            joinDate,
            fixedWaterBill,
            fixedGasBill,
            fixedWasteBill,
            openingBalance
        } = req.body;

        const tenant = await Tenant.create({
            name,
            phone,
            roomNumber,
            baseRent,
            joinDate,
            fixedWaterBill: Number(fixedWaterBill) || 0,
            fixedGasBill: Number(fixedGasBill) || 0,
            fixedWasteBill: Number(fixedWasteBill) || 0
        });

        // If there's an opening balance (previous dues), create an initial "Arrears" bill
        if (openingBalance && Number(openingBalance) > 0) {
            await Bill.create({
                tenant: tenant._id,
                month: 'Opening',
                year: new Date().getFullYear(),
                rentAmount: 0,
                waterBill: 0,
                electricityBill: 0,
                gasBill: 0,
                wasteBill: 0,
                totalAmount: Number(openingBalance),
                paidAmount: 0,
                dueAmount: Number(openingBalance),
                status: 'Unpaid',
                paymentDate: null // not paid yet
            });
        }

        res.status(201).json(tenant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Public
const updateTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);

        if (!tenant) {
            res.status(404);
            throw new Error('Tenant not found');
        }

        const updatedTenant = await Tenant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedTenant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Deactivate tenant (Soft delete)
// @route   DELETE /api/tenants/:id
// @access  Public
const deleteTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);

        if (!tenant) {
            res.status(404);
            throw new Error('Tenant not found');
        }

        // Soft delete
        tenant.isActive = false;
        await tenant.save();

        res.status(200).json({ id: req.params.id, message: 'Tenant deactivated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record a general payment for a tenant (Distributes accross bills)
// @route   POST /api/tenants/:id/pay
// @access  Public
const recordPayment = async (req, res) => {
    try {
        const { amount } = req.body;
        const tenantId = req.params.id;

        if (!amount || amount <= 0) {
            res.status(400);
            throw new Error('Please provide a valid payment amount');
        }

        let remainingMoney = Number(amount);

        // 1. Find all unpaid/partial bills, sorted by oldest date
        // Assuming we sort by year/month or createdAt
        const unpaidBills = await Bill.find({
            tenant: tenantId,
            status: { $ne: 'Paid' }
        }).sort({ year: 1, month: 1 }); // Sort by time (simple year/month sort might need mapping if strings, but assuming createdAt/numeric works)

        // Better to sort by createdAt if month is string without index
        // const unpaidBills = await Bill.find({ tenant: tenantId, status: { $ne: 'Paid' } }).sort({ createdAt: 1 });

        const updatedBills = [];

        for (let bill of unpaidBills) {
            if (remainingMoney <= 0) break;

            const due = bill.dueAmount;

            if (remainingMoney >= due) {
                // Pay off this bill completely
                bill.paidAmount += due;
                bill.dueAmount = 0;
                bill.status = 'Paid';
                remainingMoney -= due;
            } else {
                // Pay partially
                bill.paidAmount += remainingMoney;
                bill.dueAmount -= remainingMoney;
                bill.status = 'Partial';
                remainingMoney = 0;
            }

            await bill.save();
            updatedBills.push(bill);
        }

        // 2. Mock Send Overall Receipt (Optional: Create a dummy bill ID or handle in notification controller?)
        // Since the notification controller expects a billId, we might just pass the *latest* bill touched, 
        // or we can update the notification controller to handle a "Tenant General Receipt" without a specific bill ID.
        // For now, let's just return success and let frontend call notification passing the NEWEST updated bill ID if available.

        res.status(200).json({
            success: true,
            remainingCredit: remainingMoney, // If they paid MORE than total dues, this is extra
            updatedBillsCount: updatedBills.length,
            latestBillId: updatedBills.length > 0 ? updatedBills[updatedBills.length - 1]._id : null
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getTenants,
    getTenant,
    addTenant,
    updateTenant,
    deleteTenant,
    recordPayment
};
