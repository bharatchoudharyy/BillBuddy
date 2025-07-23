const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const {
    createEvent,
    addMemberToEvent,
    getEventsForUser,
    getEventDetails,
    getEventSummary
} = require('../controllers/eventController');

router.post('/', auth, createEvent);

router.get('/', auth, getEventsForUser);

router.get('/:eventId/summary', auth, getEventSummary);

router.get('/:eventId', auth, getEventDetails);

router.post('/:eventId/members', auth, addMemberToEvent);

module.exports = router;