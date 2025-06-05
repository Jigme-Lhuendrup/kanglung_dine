const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { Restaurant, Menu, User } = require('../models');


// Home route (only accessible by logged-in users)
router.get('/home', isAuthenticated, (req, res) => {
    // Prevent caching of the home page by setting appropriate headers
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.render('home', { user: req.session.user });
});

// Restaurants listing page
router.get('/restaurants', async (req, res) => {
    try {
        console.log('Fetching restaurants...');
        const restaurants = await Restaurant.findAll({
            include: [
                {
                    model: Menu,
                    attributes: ['id']
                },
                {
                    model: User,
                    attributes: ['name', 'profilePicture']
                }
            ],
            order: [['name', 'ASC']]
        });

        console.log('Restaurants fetched:', restaurants.length);
        console.log('First restaurant data:', restaurants[0] ? JSON.stringify(restaurants[0].toJSON(), null, 2) : 'No restaurants found');

        res.render('restaurants', { 
            restaurants,
            user: req.session.user
        });
    } catch (error) {
        console.error('Detailed error in fetching restaurants:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).send('Error loading restaurants: ' + error.message);
    }
});

// Restaurant menu page
router.get('/restaurants/:id/menu', async (req, res) => {
    try {
        const restaurant = await Restaurant.findByPk(req.params.id, {
            include: [
                {
                    model: Menu,
                    attributes: ['id', 'itemNo', 'itemName', 'price'],
                    order: [['itemNo', 'ASC']]
                },
                {
                    model: User,
                    attributes: ['name', 'profilePicture']
                }
            ]
        });

        if (!restaurant) {
            return res.status(404).send('Restaurant not found');
        }

        res.render('restaurant-menu', { 
            restaurant,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching restaurant menu:', error);
        res.status(500).send('Error loading restaurant menu');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login'); // Redirect to login after logout
    });
});


module.exports = router;
