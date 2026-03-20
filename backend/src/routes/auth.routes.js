const express = require('express');
const router = express.Router();

// Mock login logic
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if(email && password) {
        return res.json({ token: 'mock-jwt-token-12345', user: { email, role: 'student' } });
    }
    return res.status(400).json({ error: 'Please provide email and password' });
});

// Create user mock
router.post('/register', (req, res) => {
    const { email, password } = req.body;
    res.status(201).json({ message: 'User created successfully', email });
});

module.exports = router;
