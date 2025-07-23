const Event = require('../models/Event');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settlement = require('../models/Settlement');

exports.createEvent = async (req, res) => {
    try {
        const { eventName, currency } = req.body;
        const creatorId = req.user.id;
        const newEvent = new Event({ eventName, currency, creator: creatorId, members: [creatorId] });
        const event = await newEvent.save();
        res.status(201).json(event);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};
exports.addMemberToEvent = async (req, res) => {
    try {
        const { username } = req.body;
        const eventId = req.params.eventId;
        const userToAdd = await User.findOne({ username });
        if (!userToAdd) return res.status(404).json({ message: 'User not found.' });
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found.' });
        if (event.members.includes(userToAdd._id)) return res.status(400).json({ message: 'User is already a member.' });
        event.members.push(userToAdd._id);
        await event.save();
        res.json(event.members);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};
exports.getEventsForUser = async (req, res) => {
    try {
        const events = await Event.find({ members: req.user.id }).populate('creator', 'username').populate('members', 'username').sort({ createdAt: -1 });
        res.json(events);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};
exports.getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId).populate('creator', 'username email').populate('members', 'username email').populate({ path: 'transactions', populate: { path: 'payer', select: 'username' } });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.getEventSummary = async (req, res) => {
    try {
        const eventId = req.params.eventId;

        const [event, settlements] = await Promise.all([
            Event.findById(eventId).populate({
                path: 'transactions',
                populate: { path: 'payer', select: 'username' }
            }).populate('members', 'username _id'),
            Settlement.find({ event: eventId })
        ]);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const pairDebts = {};
        const members = event.members;
        const memberMap = new Map(members.map(m => [m._id.toString(), m.username]));

        members.forEach(member1 => {
            pairDebts[member1._id] = {};
            members.forEach(member2 => {
                if (member1._id !== member2._id) {
                    pairDebts[member1._id][member2._id] = 0;
                }
            });
        });

        // Step 1: Calculate the gross debt from user to payer for every transaction.
        event.transactions.forEach(transaction => {
            const payerId = transaction.payer._id.toString();
            transaction.splitDetails.forEach(split => {
                const debtorId = split.user.toString();
                if (debtorId !== payerId) {
                    pairDebts[debtorId][payerId] += split.owes;
                }
            });
        });

        // Step 2: Apply all recorded settlements to these direct pair-wise debts.
        settlements.forEach(settlement => {
            const debtorId = settlement.debtor.toString();
            const creditorId = settlement.creditor.toString();
            // Reduce the amount the debtor owes the creditor.
            if (pairDebts[debtorId] && pairDebts[debtorId][creditorId] !== undefined) {
                pairDebts[debtorId][creditorId] -= settlement.amount;
            }
        });

        // Step 3: Net the debts between each pair and format the final summary.
        const finalSummary = [];
        const processedPairs = new Set();

        for (const debtorId of Object.keys(pairDebts)) {
            for (const creditorId of Object.keys(pairDebts[debtorId])) {
                // To avoid processing pairs twice (A->B and B->A), create a sorted key.
                const pairKey = [debtorId, creditorId].sort().join('-');
                if (processedPairs.has(pairKey)) {
                    continue;
                }

                const debtorOwesCreditor = pairDebts[debtorId][creditorId];
                const creditorOwesDebtor = pairDebts[creditorId][debtorId];

                const netAmount = debtorOwesCreditor - creditorOwesDebtor;

                if (netAmount > 0.01) { // Debtor owes Creditor
                    finalSummary.push({
                        fromId: debtorId,
                        from: memberMap.get(debtorId),
                        toId: creditorId,
                        to: memberMap.get(creditorId),
                        amount: parseFloat(netAmount.toFixed(2))
                    });
                } else if (netAmount < -0.01) { // Creditor owes Debtor
                    finalSummary.push({
                        fromId: creditorId,
                        from: memberMap.get(creditorId),
                        toId: debtorId,
                        to: memberMap.get(debtorId),
                        amount: parseFloat(Math.abs(netAmount).toFixed(2))
                    });
                }

                processedPairs.add(pairKey);
            }
        }

        res.json({
            eventName: event.eventName,
            currency: event.currency,
            settlements: finalSummary
        });

    } catch (err) {
        console.error("Error in getEventSummary:", err.message);
        res.status(500).send('Server Error');
    }
};