const mongoose = require('mongoose');

const SettlementSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    // The user who owed the money
    debtor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // The user who was owed the money
    creditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    // The user who confirmed the settlement (should always be the creditor)
    settledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Settlement', SettlementSchema);