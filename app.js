// Import required modules
const express = require('express');
const path = require('path');
const dotenv = require('dotenv'); // load local file .env
const { sequelize } = require('./config/config.js');
const bodyParser = require('body-parser');
const session = require('express-session');
const { initializeDatabase } = require('./models');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Add session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax' // Changed from 'strict' to 'lax' for better compatibility
    }
}));

// Trust proxy in production
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const profileRoutes = require('./routes/profileRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

// Mount routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/', homeRoutes);
app.use('/profile', profileRoutes);
app.use('/reservations', reservationRoutes);
app.use('/testimonials', testimonialRoutes);
app.use('/admin', adminRoutes);
app.use('/res_owner', ownerRoutes);

// Routes before logging in
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/restaurants', (req, res) => {
    res.render('restaurants');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

// Routes after logging in
app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/lmap', (req, res) => {
    res.render('lmap');
});

app.get('/labout', (req, res) => {
    res.render('labout');
});

app.get('/lcontact', (req, res) => {
    res.render('lcontact');
});

// Restaurant routes
app.get('/Kuengasamdrup', (req, res) => {
    res.render('Kuengasamdrup');
});

app.get('/NC', (req, res) => {
    res.render('NC');
});

app.get('/Applebees', (req, res) => {
    res.render('Applebees');
});

app.get('/Namsai', (req, res) => {
    res.render('Namsai');
});

app.get('/Tashidelek', (req, res) => {
    res.render('Tashidelek');
});

// Terms and Conditions route
app.get('/terms', (req, res) => {
    res.render('terms');
});

// Database test endpoint
app.get('/db-test', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ message: 'Database connected successfully', time: new Date() });
    } catch (err) {
        res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
});

// Initialize database and start server
const startServer = async () => {
    try {
        // Initialize database
        await initializeDatabase();
        
        // Start server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
