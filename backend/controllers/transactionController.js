const Transaction = require('../models/Transaction');
const Event = require('../models/Event');

exports.addTransaction = async (req, res) => {
    try {
        const { description, totalAmount, splitDetails } = req.body;
        const payerId = req.user.id;
        const eventId = req.params.eventId;

        if (!description || totalAmount === undefined || !splitDetails) {
            return res.status(400).json({ message: "Description, total amount, and split details are required." });
        }

        const splitsSum = splitDetails.reduce((sum, split) => sum + split.owes, 0);
        if (Math.abs(splitsSum - totalAmount) > 0.01) { // Tolerance for floating point
            return res.status(400).json({ message: "The sum of individual amounts owed does not match the total transaction amount." });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        const newTransaction = new Transaction({
            description,
            totalAmount,
            payer: payerId,
            event: eventId,
            splitDetails
        });

        const transaction = await newTransaction.save();

        event.transactions.push(transaction._id);
        await event.save();

        res.status(201).json(transaction);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};