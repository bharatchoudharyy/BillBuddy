const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalAmount: { type: Number, required: true },
    description: { type: String, required: true },

    splitDetails: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        owes: { type: Number }
    }],

    status: { type: String, default: 'approved' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);