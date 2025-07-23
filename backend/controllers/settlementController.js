const Settlement = require('../models/Settlement');
const Event = require('../models/Event');
const User = require('../models/User');

exports.createSettlement = async (req, res) => {
    try {
        const { eventId, debtorId, creditorId, amount } = req.body;
        const loggedInUserId = req.user.id;

        if (loggedInUserId.toString() !== creditorId.toString()) {
            return res.status(403).json({ message: "Forbidden: You cannot settle a debt that is not owed to you." });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found." });

        const debtor = await User.findById(debtorId);
        if (!debtor) return res.status(404).json({ message: "Debtor user not found." });

        const newSettlement = new Settlement({
            event: eventId,
            debtor: debtorId,
            creditor: creditorId,
            amount,
            settledBy: loggedInUserId
        });

        await newSettlement.save();

        res.status(201).json({ message: "Debt successfully marked as settled." });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};