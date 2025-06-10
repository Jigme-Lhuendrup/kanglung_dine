const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// Admin dashboard (protected route)
router.get('/dashboard', isAdmin, adminController.getDashboard);

// Route to delete a user
router.post('/users/delete/:id', isAdmin, adminController.deleteUser);

// Admin logout
router.get('/logout', isAdmin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.redirect('/auth/login');
    });
});

module.exports = router; 
