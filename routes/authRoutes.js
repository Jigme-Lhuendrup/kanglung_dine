const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { User } = require('../models');

router.post('/signup', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);
router.get('/verify-email/:token', authController.verifyEmail);

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/login', (req, res) => {
    const successMessage = req.query.success;
    const error = req.query.error;
    res.render('login', { successMessage, error });
});

// Test route to check users in database
router.get('/check-users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role'] // Excluding password for security
        });
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;