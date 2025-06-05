const express = require('express'); // Required to use express.Router()
const router = express.Router();
// Render the landing page
router.get('/', (req, res) => {
res.render('index', { title: 'Kanglung Dine' });
});

// Login & Sign up
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});
  
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});
  
module.exports = router;