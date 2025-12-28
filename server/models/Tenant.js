const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        // Note: Should include country code, e.g., +880...
    },
    roomNumber: {
        type: String,
        required: true
    },
    familyMembers: {
        type: Number,
        default: 1
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    baseRent: {
        type: Number,
        required: true,
        default: 0
    },
    fixedWaterBill: {
        type: Number,
        default: 0
    },
    fixedGasBill: {
        type: Number,
        default: 0
    },
    fixedWasteBill: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Tenant', tenantSchema);
