const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    month: {
        type: String, // Format: "MM-YYYY" or "Month Year"
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    rentAmount: {
        type: Number,
        required: true,
        default: 0
    },
    waterBill: {
        type: Number,
        default: 0
    },
    electricityBill: {
        type: Number,
        default: 0
    },
    gasBill: {
        type: Number,
        default: 0
    },
    wasteBill: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Partial'],
        default: 'Unpaid'
    },
    paymentDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bill', billSchema);
