const express = require('express');
const router = express.Router();
const { Testimonial } = require('../models');

// Create a new testimonial
router.post('/submit', async (req, res) => {
    try {
        const { name, email, message, rating } = req.body;
        const testimonial = await Testimonial.create({
            name,
            email,
            message,
            rating: rating || null
        });
        res.json({ success: true, testimonial });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({ success: false, error: 'Failed to submit testimonial' });
    }
});

// Get all testimonials
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

module.exports = router; 