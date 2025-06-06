const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { Restaurant } = require('../models');
const { sequelize } = require('../config/config.js');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/email');

// Admin credentials (in production, these should be in environment variables)
const ADMIN_EMAIL = 'admin@kanglungdine.com';
const ADMIN_PASSWORD = 'KD@admin2024#secure';

// Signup
exports.registerUser = async (req, res) => {
    let transaction;
    
    try {
        // Start transaction
        transaction = await sequelize.transaction();
        console.log('Transaction started');

        console.log('Registration attempt with data:', {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        });

        const { name, email, password, role, restaurantName, restaurantAddress, restaurantPhone, restaurantHours } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password, role: !!role });
            return res.render('signup', { 
                error: 'All fields are required',
                name,
                email,
                role
            });
        }

        if (role === 'owner' && (!restaurantName || !restaurantAddress || !restaurantPhone || !restaurantHours)) {
            return res.render('signup', {
                error: 'All restaurant fields are required for restaurant owners',
                name,
                email,
                role,
                restaurantName,
                restaurantAddress,
                restaurantPhone,
                restaurantHours
            });
        }

        if (!['user', 'owner', 'admin'].includes(role)) {
            console.log('Invalid role:', role);
            return res.render('signup', { 
                error: 'Invalid role selected',
                name,
                email
            });
        }

        if (email === ADMIN_EMAIL) {
            return res.render('signup', { 
                error: 'This email cannot be used for registration',
                name
            });
        }

        // Check for existing user with detailed logging
        console.log('Checking for existing user with email:', email);
        const existingUser = await User.findOne({ 
            where: { email },
            transaction
        });

        if (existingUser) {
            console.log('Found existing user:', {
                id: existingUser.id,
                email: existingUser.email,
                role: existingUser.role
            });
            await transaction.rollback();
            return res.render('signup', { 
                error: 'Email already registered',
                name
            });
        }

        // Create new user
        console.log('Creating new user...');
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            verificationToken,
            isVerified: false
        }, { transaction });

        console.log('User created successfully:', {
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Handle restaurant creation for owners
        if (role === 'owner') {
            console.log('Creating restaurant for owner...');
            try {
                const restaurant = await Restaurant.create({
                    name: restaurantName,
                    ownerId: user.id,
                    address: restaurantAddress,
                    phone: restaurantPhone,
                    openingHours: restaurantHours,
                    description: `Welcome to ${restaurantName}, owned by ${name}.`
                }, { transaction });

                console.log('Restaurant created successfully:', {
                    id: restaurant.id,
                    name: restaurant.name,
                    ownerId: restaurant.ownerId
                });
            } catch (error) {
                console.error('Error creating restaurant:', error);
                await transaction.rollback();
                throw error;
            }
        }

        // Send verification email
        try {
            console.log('Sending verification email...');
            await sendVerificationEmail(user.email, user.verificationToken);
            console.log('Verification email sent successfully');
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            await transaction.rollback();
            throw emailError;
        }

        // Commit transaction
        await transaction.commit();
        console.log('Transaction committed successfully');

        return res.redirect('/auth/login?success=Registration successful! Please check your email to verify your account.');
    } catch (err) {
        console.error('Registration error:', err);
        if (transaction) {
            console.log('Rolling back transaction due to error');
            await transaction.rollback();
        }
        return res.render('signup', { 
            error: 'Error registering user: ' + err.message,
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            restaurantName: req.body.restaurantName,
            restaurantAddress: req.body.restaurantAddress,
            restaurantPhone: req.body.restaurantPhone,
            restaurantHours: req.body.restaurantHours
        });
    }
};

// Login
exports.loginUser = async (req, res) => {
    try {
        console.log('Login attempt:', {
            email: req.body.email
        });

        const { email, password } = req.body;

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            let adminUser = await User.findOne({ where: { email: ADMIN_EMAIL } });

            if (!adminUser) {
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                adminUser = await User.create({
                    name: 'Administrator',
                    email: ADMIN_EMAIL,
                    password: hashedPassword,
                    role: 'admin',
                    isVerified: true
                });
                console.log('Admin user created in database:', adminUser.toJSON());
            } else {
                if (adminUser.role !== 'admin' || !adminUser.isVerified) {
                    adminUser.role = 'admin';
                    adminUser.isVerified = true;
                    await adminUser.save();
                    console.log('Admin user updated in database:', adminUser.toJSON());
                }
            }

            req.session.isAdmin = true;
            req.session.user = {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role
            };
            console.log('Admin login successful, session set:', req.session.user);
            return res.redirect('/admin/dashboard');
        }

        const user = await User.findOne({ 
            where: { email },
            attributes: ['id', 'name', 'email', 'password', 'role', 'isVerified']
        });

        if (!user) {
            console.log('Login failed: User not found for email:', email);
            return res.render('login', { error: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            console.log('Login failed: Email not verified for user:', email);
            return res.render('login', { error: 'Please verify your email address before logging in. Check your inbox for a verification email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Login failed: Invalid password for email:', email);
            return res.render('login', { error: 'Invalid email or password' });
        }

        req.session.user = { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            role: user.role 
        };
        req.session.isAdmin = false;

        console.log('Login successful:', {
            id: user.id,
            email: user.email,
            role: user.role
        });

        if (user.role === 'owner') {
            console.log('Redirecting to owner dashboard');
            return res.redirect('/res_owner/dashboard');
        } else {
            console.log('Redirecting to home');
            return res.redirect('/home');
        }
    } catch (err) {
        console.error('Login error:', err);
        return res.render('login', { error: 'Error logging in: ' + err.message });
    }
};

// Logout
exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).send('Verification token is missing.');
        }

        const user = await User.findOne({ where: { verificationToken: token } });

        if (!user) {
            return res.status(400).send('Invalid or expired verification token. Please try registering again or contact support.');
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        return res.redirect('/auth/login?success=Email verified successfully! You can now login.');
    } catch (err) {
        console.error('Email verification error:', err);
        return res.status(500).send('Error verifying email: ' + err.message);
    }
};
