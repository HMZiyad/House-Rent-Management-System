const axios = require('axios');
const Tenant = require('../models/Tenant');
const Bill = require('../models/Bill');

// @desc    Send WhatsApp Invoice
// @route   POST /api/notifications/send-invoice
// @access  Public
const sendInvoice = async (req, res) => {
    try {
        const { billId } = req.body;
        const bill = await Bill.findById(billId).populate('tenant');

        if (!bill) {
            res.status(404);
            throw new Error('Bill not found');
        }

        const tenant = bill.tenant;

        // Calculate Total Due (Current Bill + Arrears)
        // NOTE: This simple logic assumes 'dueAmount' in other bills tracks arrears.
        // Ideally, we sum up all 'dueAmount' from all 'Unpaid/Partial' bills for this tenant.
        const allUnpaidBills = await Bill.find({
            tenant: tenant._id,
            status: { $in: ['Unpaid', 'Partial'] }
        });

        const totalDue = allUnpaidBills.reduce((acc, curr) => acc + curr.dueAmount, 0);

        // Format Message
        // "Dear [Name], your rent for [Month] is [Total] BDT. Breakdown: Rent: [X], Elec: [Y], Water: [Z]. Please pay by [Date]. Total Due: [Dues] BDT."

        const message = `Dear ${tenant.name}, your rent for ${bill.month} ${bill.year} is ${bill.totalAmount} BDT. ` +
            `Breakdown: Rent: ${bill.rentAmount}, Elec: ${bill.electricityBill}, Water: ${bill.waterBill}. ` +
            `Please pay by 10th. Total Due: ${totalDue} BDT.`;

        console.log('Sending WhatsApp Message to:', tenant.phone);
        console.log('Message:', message);

        // Mock sending for now (or integrate with external API like Twilio/Meta)
        // const response = await axios.post('WHATSAPP_API_URL', { ... });

        res.status(200).json({
            success: true,
            message: 'Invoice sent successfully',
            preview: message
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Send WhatsApp Receipt (Paid)
// @route   POST /api/notifications/send-receipt
// @access  Public
const sendReceipt = async (req, res) => {
    try {
        const { billId, receivedAmount } = req.body;
        const bill = await Bill.findById(billId).populate('tenant');

        if (!bill) {
            res.status(404);
            throw new Error('Bill not found');
        }

        const tenant = bill.tenant;

        // Calculate amounts
        const amountReceived = receivedAmount ? Number(receivedAmount) : (bill.paidAmount || bill.totalAmount);

        // Calculate Total Remaining Arrears for Tenant (All bills)
        // We re-fetch to ensure we get the latest state after updates
        const allUnpaidBills = await Bill.find({
            tenant: tenant._id,
            status: { $ne: 'Paid' }
        });
        console.log(`DEBUG: Found ${allUnpaidBills.length} unpaid bills for calculation.`);
        allUnpaidBills.forEach(b => console.log(`- Bill ${b.month} ${b.year}: ${b.dueAmount}`));

        const totalArrears = allUnpaidBills.reduce((acc, curr) => acc + curr.dueAmount, 0);

        // Bill Specific Status Message
        const billStatusMsg = bill.dueAmount <= 0
            ? `${bill.month} ${bill.year} dues cleared.`
            : `${bill.month} ${bill.year} remaining due: ${bill.dueAmount} BDT.`;

        // Format Message
        const message = `Payment Received. Dear ${tenant.name}, we received ${amountReceived} BDT. ${billStatusMsg} Total Account Arrears: ${totalArrears} BDT. Thank you!`;

        console.log('------------------------------------------------');
        console.log('PAYMENT RECEIVED');
        console.log('Tenant:', tenant.name);
        console.log('Received:', amountReceived, 'BDT');
        console.log('Bill Status:', billStatusMsg);
        console.log('Total Arrears:', totalArrears, 'BDT');
        console.log('Message Sent:', message);
        console.log('------------------------------------------------');

        // Mock sending
        // const response = await axios.post('WHATSAPP_API_URL', { ... });

        res.status(200).json({
            success: true,
            message: 'Receipt sent successfully',
            preview: message
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    sendInvoice,
    sendReceipt
};
