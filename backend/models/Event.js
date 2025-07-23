const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventName: { type: String, required: true, trim: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    currency: { type: String, enum: ['USD', 'INR'], required: true },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    status: { type: String, enum: ['active', 'settled'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);