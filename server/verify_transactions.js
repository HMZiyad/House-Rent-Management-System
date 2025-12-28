const mongoose = require('mongoose');
const Bill = require('./models/Bill');
const Payment = require('./models/Payment');
const { getMonthlyReport } = require('./controllers/reportController');

mongoose.connect('mongodb://localhost:27017/house-rental', { useNewUrlParser: true, useUnifiedTopology: true });

async function verify() {
    try {
        // 1. Find a bill
        const bill = await Bill.findOne({ status: { $ne: 'Paid' } });
        if (!bill) {
            console.log('No unpaid bill found to test.');
            return;
        }
        console.log('Testing with Bill ID:', bill._id);
        console.log('Initial Paid:', bill.paidAmount);

        // 2. Simulate Payment via update logic (mocking request)
        // We can't easily call controller directly without req/res mock, so let's replicate the logic or call API
        // actually easier to just use axios if server is running, but let's do it manually to be quick

        const newPayment = 500;
        const paidDifference = newPayment; // assuming we add 500

        // Create Payment Manually to verify Report picks it up
        await Payment.create({
            tenant: bill.tenant,
            bill: bill._id,
            amount: paidDifference,
            date: new Date()
        });

        console.log('Created Payment of:', paidDifference);

        // 3. Check Report
        // Mock res
        const res = {
            status: (code) => ({
                json: (data) => {
                    console.log('Report Data Transactions:', JSON.stringify(data.transactions, null, 2));
                }
            })
        };
        const req = {
            query: {
                month: bill.month,
                year: bill.year,
                tenantId: bill.tenant
            }
        };

        await getMonthlyReport(req, res);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

verify();
