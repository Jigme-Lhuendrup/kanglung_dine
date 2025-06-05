const { User, Restaurant, Reservation, sequelize } = require('../models'); // Import necessary models and sequelize

exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.count();
        console.log('Fetched totalUsers:', totalUsers); // DEBUG
        const totalRestaurants = await Restaurant.count();
        console.log('Fetched totalRestaurants:', totalRestaurants); // DEBUG

        // Find most popular restaurants by reservation count
        const popularRestaurantsRaw = await Reservation.findAll({
            attributes: [
                'restaurantId', // Corrected casing
                [sequelize.fn('COUNT', sequelize.col('restaurantId')), 'reservationCount'] // Corrected casing
            ],
            include: [{
                model: Restaurant,
                attributes: ['name']
            }],
            group: ['Reservation.restaurantId', 'Restaurant.id', 'Restaurant.name'], // Corrected casing
            order: [[sequelize.fn('COUNT', sequelize.col('restaurantId')), 'DESC']], // Corrected casing
            limit: 3 // Get top 3, adjust as needed
        });
        console.log('Fetched popularRestaurantsRaw:', JSON.stringify(popularRestaurantsRaw, null, 2)); // DEBUG

        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'isVerified', 'createdAt']
        });

        const popularRestaurantsFormatted = popularRestaurantsRaw.map(r => ({
            name: r.Restaurant ? r.Restaurant.name : 'Unknown Restaurant', // Handle case where Restaurant might be null
            count: r.get('reservationCount')
        }));
        console.log('Formatted popularRestaurants:', JSON.stringify(popularRestaurantsFormatted, null, 2)); // DEBUG

        const viewData = {
            user: req.session.user,
            users: users,
            totalUsers,
            totalRestaurants,
            popularRestaurants: popularRestaurantsFormatted,
            success: req.query.success,
            error: req.query.error
        };
        console.log('Data being sent to view:', JSON.stringify(viewData, null, 2)); // DEBUG
        res.render('admin/dashboard', viewData);
    } catch (error) {
        console.error('Error fetching data for admin dashboard:', error);
        res.render('admin/dashboard', {
            user: req.session.user,
            users: [],
            totalUsers: 0,
            totalRestaurants: 0,
            popularRestaurants: [],
            error: 'Failed to load dashboard data.'
        });
    }
};

exports.deleteUser = async (req, res) => {
    const userIdToDelete = req.params.id;
    const adminUserId = req.session.user.id;

    try {
        // Prevent admin from deleting themselves
        if (parseInt(userIdToDelete, 10) === parseInt(adminUserId, 10)) {
            return res.redirect('/admin/dashboard?error=Admins cannot delete their own account.');
        }

        const userToDelete = await User.findByPk(userIdToDelete);

        if (!userToDelete) {
            return res.redirect('/admin/dashboard?error=User not found.');
        }

        // Optional: Add logic here if the user is an 'owner'
        // For example, delete associated restaurants or prevent deletion if restaurants exist.
        // For now, we'll just delete the user.
        // if (userToDelete.role === 'owner') {
        //     await Restaurant.destroy({ where: { ownerId: userIdToDelete } });
        // }

        await userToDelete.destroy();
        console.log(`User with ID: ${userIdToDelete} deleted by admin ID: ${adminUserId}`);
        return res.redirect('/admin/dashboard?success=User deleted successfully.');

    } catch (error) {
        console.error('Error deleting user:', error);
        return res.redirect(`/admin/dashboard?error=Error deleting user: ${error.message}`);
    }
};