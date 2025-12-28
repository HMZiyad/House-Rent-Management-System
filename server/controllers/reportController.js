const Bill = require('../models/Bill');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');

// @desc    Get Property Report Stats
// @route   GET /api/reports/property
// @access  Public
const getPropertyReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = {};

        if (month && year) {
            query = { month, year: Number(year) };
        }

        const bills = await Bill.find(query);

        // Calculate totals
        const totalRevenue = bills.reduce((acc, bill) => acc + (bill.rentAmount || 0), 0);
        const totalCollected = bills.reduce((acc, bill) => acc + (bill.paidAmount || 0), 0);
        const totalOutstanding = bills.reduce((acc, bill) => acc + (bill.dueAmount || 0), 0);

        // Expenses (Utility Bills sum)
        const totalUtilityExpenses = bills.reduce((acc, bill) =>
            acc + (bill.waterBill || 0) + (bill.electricityBill || 0) + (bill.gasBill || 0) + (bill.wasteBill || 0), 0);

        const report = {
            period: month && year ? `${month} ${year}` : 'All Time',
            totalRevenue, // Potential Revenue (Rent)
            totalCollected, // Actual Money In
            totalOutstanding, // Money pending
            totalUtilityExpenses, // Money Out (Utilities)
            netIncome: totalCollected - totalUtilityExpenses, // Rough Net
            billsCount: bills.length
        };

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMonthlyReport = async (req, res) => {
    try {
        const { month, year, tenantId } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and Year are required' });
        }

        // 1. Find relevant tenants
        // If tenantId is provided, just that one. Otherwise, all active tenants.
        let tenantQuery = { isActive: true };
        if (tenantId) {
            tenantQuery._id = tenantId;
        }
        const tenants = await Tenant.find(tenantQuery).select('name roomNumber baseRent fixedWaterBill fixedGasBill fixedWasteBill');

        // 2. Find bills for the specified period
        // If tenantId is provided, filter bills for that tenant too (though mapping handles it)
        let billQuery = { month, year: Number(year) };
        if (tenantId) {
            billQuery.tenant = tenantId;
        }
        const bills = await Bill.find(billQuery);

        // 3. Combine Data
        const reportData = tenants.map(tenant => {
            const tenantBill = bills.find(b => b.tenant.toString() === tenant._id.toString());

            if (tenantBill) {
                return {
                    tenantId: tenant._id,
                    name: tenant.name,
                    roomNumber: tenant.roomNumber,
                    status: tenantBill.status, // Paid, Unpaid, Partial
                    rentAmount: tenantBill.rentAmount,
                    totalUtility: (tenantBill.waterBill || 0) + (tenantBill.electricityBill || 0) + (tenantBill.gasBill || 0) + (tenantBill.wasteBill || 0),
                    totalDue: tenantBill.dueAmount,
                    totalPaid: tenantBill.paidAmount,
                    totalAmount: tenantBill.totalAmount
                };
            } else {
                // If no bill generated yet for this active tenant, consider it unpaid/pending generation
                // Assuming base rent + fixed utils as projected
                const projectedUtility = (tenant.fixedWaterBill || 0) + (tenant.fixedGasBill || 0) + (tenant.fixedWasteBill || 0);
                return {
                    tenantId: tenant._id,
                    name: tenant.name,
                    roomNumber: tenant.roomNumber,
                    status: 'No Bill',
                    rentAmount: tenant.baseRent,
                    totalUtility: projectedUtility,
                    totalDue: tenant.baseRent + projectedUtility, // Assuming all due
                    totalPaid: 0,
                    totalAmount: tenant.baseRent + projectedUtility
                };
            }
        });

        // 4. If tenant report, fetch transactions for this period
        let transactions = [];
        if (tenantId) {
            // Find bills for this month to get their IDs
            const billIds = bills.map(b => b._id);

            transactions = await Payment.find({
                bill: { $in: billIds }
            }).sort({ date: 1 });
        }

        // 5. Calculate Overall Totals
        const summary = {
            totalRevenue: reportData.reduce((acc, r) => acc + r.totalAmount, 0),
            totalCollected: reportData.reduce((acc, r) => acc + r.totalPaid, 0),
            totalDue: reportData.reduce((acc, r) => acc + r.totalDue, 0),
            totalUtility: reportData.reduce((acc, r) => acc + r.totalUtility, 0),
        };

        res.status(200).json({
            period: `${month} ${year}`,
            tenants: reportData,
            transactions, // Include transactions in response
            summary
        });

    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPropertyReport,
    getMonthlyReport
};
