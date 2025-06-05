const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { User } = require('../models');

// POST /auth/signup - Register new user
router.post('/signup', authController.registerUser);

// POST /auth/login - Login user
router.post('/login', authController.loginUser);

// GET /auth/logout - Logout user and destroy session
router.get('/logout', authController.logoutUser);

// GET /auth/verify-email/:token - Verify user email
router.get('/verify-email/:token', authController.verifyEmail);

// GET /auth/signup - Render signup form
router.get('/signup', (req, res) => {
    res.render('signup');
});

// GET /auth/login - Render login form with optional success or error messages
router.get('/login', (req, res) => {
    const successMessage = req.query.success;
    const error = req.query.error;
    res.render('login', { successMessage, error });
});

// Test route to check users in database (for debugging)
router.get('/check-users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role'] // Exclude password
        });
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

module.exports = router;
