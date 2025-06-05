// Import required modules
const express = require('express');
const path = require('path');
const dotenv = require('dotenv'); // load local file .env
const { sequelize } = require('./config/config.js');
const bodyParser = require('body-parser');
const session = require('express-session');
const { initializeDatabase } = require('./models');
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Set up session store
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "Session",
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000,
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Trust proxy in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Import and mount routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/', require('./routes/homeRoutes'));
app.use('/profile', require('./routes/profileRoutes'));
app.use('/reservations', require('./routes/reservationRoutes'));
app.use('/testimonials', require('./routes/testimonialRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/res_owner', require('./routes/ownerRoutes'));

// Static page routes
app.get('/', (req, res) => res.render('index'));
app.get('/restaurants', (req, res) => res.render('restaurants'));
app.get('/about', (req, res) => res.render('about'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/home', (req, res) => res.render('home'));
app.get('/lmap', (req, res) => res.render('lmap'));
app.get('/labout', (req, res) => res.render('labout'));
app.get('/lcontact', (req, res) => res.render('lcontact'));
app.get('/Kuengasamdrup', (req, res) => res.render('Kuengasamdrup'));
app.get('/NC', (req, res) => res.render('NC'));
app.get('/Applebees', (req, res) => res.render('Applebees'));
app.get('/Namsai', (req, res) => res.render('Namsai'));
app.get('/Tashidelek', (req, res) => res.render('Tashidelek'));
app.get('/terms', (req, res) => res.render('terms'));

// Database test route
app.get('/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: 'Database connected successfully', time: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Start server sequence
const startServer = async () => {
  try {
    await sessionStore.sync();
    await initializeDatabase();
    await sequelize.sync({ force: false });

    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
