const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Check if user already exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'User with this email or username already exists.' });
        }

        // 2. Create new user instance
        user = new User({ username, email, password });

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // 4. Generate JWT Token
        const payload = { user: { id: user.id, username: user.username } }; // Add username to token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });

        res.status(201).json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        // 1. Check if user exists by either email or username
        const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 3. Generate JWT Token, including username for frontend use
        const payload = { user: { id: user.id, username: user.username } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });

        res.status(200).json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};