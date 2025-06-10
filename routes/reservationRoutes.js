const express = require('express');
const router = express.Router();
const { Reservation, Restaurant, User } = require('../models');
const { sequelize } = require('../config/config.js');
const isOwner = require('../middleware/ownerAuth');

// Route to show the reservation form
router.get('/', async (req, res) => {
    try {
        // Fetch only active restaurants
        const restaurants = await Restaurant.findAll({
            attributes: ['id', 'name', 'description', 'openingHours'],
            include: [{
                model: User,
                attributes: ['name'],
                as: 'User'
            }],
            order: [['name', 'ASC']]
        });
        res.render('reservation', { restaurants });
    } catch (err) {
        console.error('Error fetching restaurants:', err.message);
        res.status(500).send('Error loading reservation form');
    }
});

// Route to view all reservations
router.get('/view-reservations', async (req, res) => {
    try {
        console.log('Session user:', req.session.user); // Debug log

        // If user is an owner, redirect to owner dashboard
        if (req.session.user.role === 'owner') {
            return res.redirect('/res_owner/dashboard');
        }

        // For regular users, show their own reservations
        const reservations = await Reservation.findAll({
            where: {
                userId: req.session.user.id
            },
            include: [
                {
                    model: Restaurant,
                    attributes: ['name', 'address', 'phone'],
                    include: [{
                        model: User,
                        attributes: ['name'],
                        as: 'User'
                    }]
                }
            ],
            order: [
                ['date', 'DESC'],
                ['time', 'DESC']
            ]
        });

        console.log('Found reservations:', reservations.length); // Debug log
        console.log('First reservation:', reservations[0]); // Debug log

        res.render('view-reservations', { 
            reservations,
            isOwner: false
        });
    } catch (err) {
        console.error('Error fetching reservations:', err.message);
        res.status(500).send('Error fetching reservations');
    }
});

// Route to create a new reservation
router.post('/', async (req, res) => {
    const { restaurantId, date, time, numberOfGuests, specialRequests } = req.body;

    try {
        if (!req.session.user?.id) {
            return res.status(401).send('You must be logged in to make a reservation');
        }

        // Verify restaurant exists
        const restaurant = await Restaurant.findByPk(restaurantId, {
            include: [{
                model: User,
                attributes: ['name'],
                as: 'User'
            }]
        });

        if (!restaurant) {
            const restaurants = await Restaurant.findAll({
                include: [{
                    model: User,
                    attributes: ['name'],
                    as: 'User'
                }]
            });
            return res.status(404).render('reservation', {
                error: 'Selected restaurant not found',
                restaurants
            });
        }

        await Reservation.create({
            restaurantId,
            date,
            time,
            numberOfGuests: parseInt(numberOfGuests),
            specialRequests,
            userId: req.session.user.id,
            status: 'pending'
        });
        
        const restaurants = await Restaurant.findAll({
            include: [{
                model: User,
                attributes: ['name'],
                as: 'User'
            }]
        });
        
        res.render('reservation', { 
            successMessage: 'Reservation successfully registered!',
            showPopup: true,
            restaurants
        });
    } catch (err) {
        console.error('Error creating reservation:', err.message);
        const restaurants = await Restaurant.findAll({
            include: [{
                model: User,
                attributes: ['name'],
                as: 'User'
            }]
        });
        res.status(500).render('reservation', {
            error: 'Failed to create reservation: ' + err.message,
            restaurants
        });
    }
});

// Route to cancel a reservation
router.post('/:id/cancel', async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id, {
            include: [{ model: Restaurant }]
        });

        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        // Check if user has permission to cancel
        if (req.session.user.role === 'owner') {
            const restaurant = await Restaurant.findOne({
                where: { ownerId: req.session.user.id }
            });
            if (reservation.restaurantId !== restaurant.id) {
                return res.status(403).send('Not authorized to cancel this reservation');
            }
            await reservation.update({ status: 'cancelled' });
            return res.redirect('/res_owner/dashboard');
        } else if (reservation.userId !== req.session.user.id) {
            return res.status(403).send('Not authorized to cancel this reservation');
        }

        await reservation.update({ status: 'cancelled' });
        res.redirect('/reservations/view-reservations');
    } catch (err) {
        console.error('Error cancelling reservation:', err.message);
        res.status(500).send('Failed to cancel reservation');
    }
});

// Route to show modify reservation form
router.get('/:id/modify', async (req, res) => {
    try {
        const reservation = await Reservation.findOne({
            where: { 
                id: req.params.id,
                userId: req.session.user.id
            },
            include: [{ 
                model: Restaurant,
                include: [{
                    model: User,
                    attributes: ['name'],
                    as: 'User'
                }]
            }]
        });
        
        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }
        
        const restaurants = await Restaurant.findAll({
            include: [{
                model: User,
                attributes: ['name'],
                as: 'User'
            }]
        });
        res.render('modify-reservation', { reservation, restaurants });
    } catch (err) {
        console.error('Error fetching reservation:', err.message);
        res.status(500).send('Error fetching reservation');
    }
});

// Route to update a reservation
router.post('/:id/modify', async (req, res) => {
    const { restaurantId, date, time, numberOfGuests, specialRequests } = req.body;
    
    try {
        const reservation = await Reservation.findOne({
            where: { 
                id: req.params.id,
                userId: req.session.user.id
            }
        });

        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        await reservation.update({
            restaurantId,
            date,
            time,
            numberOfGuests: parseInt(numberOfGuests),
            specialRequests,
            status: 'pending' // Reset to pending after modification
        });
        
        res.redirect('/reservations/view-reservations');
    } catch (err) {
        console.error('Error updating reservation:', err.message);
        res.status(500).send('Failed to update reservation');
    }
});

// Route to accept a reservation (owner only)
router.post('/:id/accept', isOwner, async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id, {
            include: [{ model: Restaurant }]
        });

        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        // Verify the reservation belongs to the owner's restaurant
        const restaurant = await Restaurant.findOne({
            where: { ownerId: req.session.user.id }
        });

        if (!restaurant || reservation.restaurantId !== restaurant.id) {
            return res.status(403).send('Not authorized to manage this reservation');
        }

        await reservation.update({ status: 'confirmed' });
        res.redirect('/res_owner/dashboard');
    } catch (err) {
        console.error('Error accepting reservation:', err.message);
        res.status(500).send('Failed to accept reservation');
    }
});

// Route to reject a reservation (owner only)
router.post('/:id/reject', isOwner, async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id, {
            include: [{ model: Restaurant }]
        });

        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        // Verify the reservation belongs to the owner's restaurant
        const restaurant = await Restaurant.findOne({
            where: { ownerId: req.session.user.id }
        });

        if (!restaurant || reservation.restaurantId !== restaurant.id) {
            return res.status(403).send('Not authorized to manage this reservation');
        }

        await reservation.update({ status: 'rejected' });
        res.redirect('/res_owner/dashboard');
    } catch (err) {
        console.error('Error rejecting reservation:', err.message);
        res.status(500).send('Failed to reject reservation');
    }
});

module.exports = router;
