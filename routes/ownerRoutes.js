const express = require('express');
const router = express.Router();
const isOwner = require('../middleware/ownerAuth');
const multer = require('multer');
const path = require('path');
const { User, Restaurant, Reservation, Menu } = require('../models');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/profile-pictures');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
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

// Restaurant owner dashboard
router.get('/dashboard', isOwner, async (req, res) => {
    try {
        // Get the restaurant owned by the current user
        const restaurant = await Restaurant.findOne({
            where: { ownerId: req.session.user.id }
        });

        if (!restaurant) {
            return res.status(404).send('Restaurant not found');
        }

        // Get all reservations for this restaurant
        const reservations = await Reservation.findAll({
            where: { restaurantId: restaurant.id },
            include: [
                {
                    model: User,
                    attributes: ['name', 'email']
                }
            ],
            order: [
                ['date', 'ASC'],
                ['time', 'ASC']
            ]
        });

        // Get menu items for this restaurant
        const menuItems = await Menu.findAll({
            where: { restaurantId: restaurant.id },
            order: [['itemNo', 'ASC']],
            attributes: ['id', 'itemNo', 'itemName', 'price'],
            include: [{
                model: Restaurant,
                attributes: ['name']
            }]
        });

        res.render('res_owner/ownerDashboard', {
            user: req.session.user,
            restaurant,
            reservations,
            menuItems
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Error loading dashboard');
    }
});

// Menu Management Routes
// Add a new menu item
router.post('/add-menu-item', isOwner, async (req, res) => {
    try {
        const { itemNo, itemName, price } = req.body;
        
        // Get the restaurant owned by the current user
        const restaurant = await Restaurant.findOne({
            where: { ownerId: req.session.user.id }
        });

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Validate input
        if (!itemNo || !itemName || !price) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create new menu item
        await Menu.create({
            itemNo: parseInt(itemNo),
            itemName,
            price: parseFloat(price),
            restaurantId: restaurant.id
        });

        // Fetch updated menu items
        const menuItems = await Menu.findAll({
            where: { restaurantId: restaurant.id },
            order: [['itemNo', 'ASC']],
            attributes: ['id', 'itemNo', 'itemName', 'price']
        });

        // Fetch updated reservations
        const reservations = await Reservation.findAll({
            where: { restaurantId: restaurant.id },
            include: [
                {
                    model: User,
                    attributes: ['name', 'email']
                }
            ],
            order: [
                ['date', 'ASC'],
                ['time', 'ASC']
            ]
        });

        // Render the dashboard with updated data
        res.render('res_owner/ownerDashboard', {
            user: req.session.user,
            restaurant,
            reservations,
            menuItems,
            successMessage: 'Menu item added successfully!'
        });
    } catch (error) {
        console.error('Error adding menu item:', error);
        
        // Get the restaurant and current menu items for error case
        const restaurant = await Restaurant.findOne({
            where: { ownerId: req.session.user.id }
        });
        
        const menuItems = await Menu.findAll({
            where: { restaurantId: restaurant.id },
            order: [['itemNo', 'ASC']],
            attributes: ['id', 'itemNo', 'itemName', 'price']
        });

        const reservations = await Reservation.findAll({
            where: { restaurantId: restaurant.id },
            include: [
                {
                    model: User,
                    attributes: ['name', 'email']
                }
            ],
            order: [
                ['date', 'ASC'],
                ['time', 'ASC']
            ]
        });

        res.render('res_owner/ownerDashboard', {
            user: req.session.user,
            restaurant,
            reservations,
            menuItems,
            errorMessage: 'Error adding menu item: ' + error.message
        });
    }
});

// Update a menu item
router.put('/menu/:id', isOwner, async (req, res) => {
    try {
        const { id } = req.params;
        const { itemNo, itemName, price } = req.body;

        // Verify the menu item belongs to the owner's restaurant
        const restaurant = await Restaurant.findOne({
            where: { ownerId: req.session.user.id }
        });

        const menuItem = await Menu.findOne({
            where: {
                id,
                restaurantId: restaurant.id
            }
        });

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        await menuItem.update({
            itemNo,
            itemName,
            price
        });

        res.json(menuItem);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Error updating menu item' });
    }
});

// Delete a menu item
router.delete('/menu/:id', isOwner, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verify the menu item belongs to the owner's restaurant
        const restaurant = await Restaurant.findOne({
            where: { ownerId: req.session.user.id }
        });

        const menuItem = await Menu.findOne({
            where: {
                id,
                restaurantId: restaurant.id
            }
        });
        
        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        await menuItem.destroy();
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Error deleting menu item' });
    }
});

// Update profile picture
router.post('/update-profile-picture', isOwner, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const profilePicturePath = '/uploads/profile-pictures/' + req.file.filename;
        
        // Update user in database
        await User.update(
            { profilePicture: profilePicturePath },
            { where: { id: req.session.user.id } }
        );

        // Update session
        req.session.user.profilePicture = profilePicturePath;

        res.json({
            success: true,
            profilePicture: profilePicturePath
        });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ success: false, message: 'Error updating profile picture' });
    }
});

// Owner logout
router.get('/logout', isOwner, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router; 
