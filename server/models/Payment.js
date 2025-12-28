const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    bill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        default: 'Rent' // Rent, Utility, etc. (Optional for now)
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
