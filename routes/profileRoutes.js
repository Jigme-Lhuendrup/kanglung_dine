const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../models');

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/userimages';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Use user ID and timestamp to ensure unique filenames
        const uniqueSuffix = `${req.session.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueSuffix);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// Get profile page
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.user.id);
        if (!user) {
            return res.redirect('/auth/login');
        }
        res.render('profile', { 
            user: user.toJSON(),
            title: 'User Profile'
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).render('error', { message: 'Error loading profile' });
    }
});

// Update bio
router.post('/profile/update-bio', isAuthenticated, async (req, res) => {
    try {
        const { bio } = req.body;
        const userId = req.session.user.id;

        // Update bio in database
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await user.update({ bio });
        
        // Update session
        req.session.user = user.toJSON();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating bio:', error);
        res.status(500).json({ success: false, error: 'Failed to update bio' });
    }
});

// Update profile picture
router.post('/update-picture', isAuthenticated, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const userId = req.session.user.id;
        const pictureUrl = `/userimages/${req.file.filename}`;

        // Get user from database
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Delete old profile picture if it exists
        if (user.profilePicture) {
            const oldPicturePath = path.join('public', user.profilePicture);
            if (fs.existsSync(oldPicturePath)) {
                fs.unlinkSync(oldPicturePath);
            }
        }

        // Update profile picture in database
        await user.update({ profilePicture: pictureUrl });
        
        // Update session
        req.session.user = user.toJSON();
        
        res.json({ success: true, pictureUrl });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        // Delete uploaded file if database update fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, error: 'Failed to update profile picture' });
    }
});

module.exports = router;