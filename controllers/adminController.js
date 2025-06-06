const { User, Restaurant, Reservation, sequelize } = require('../models'); // Import necessary models and sequelize

exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalRestaurants = await Restaurant.count();

        // Find most popular restaurants by reservation count
        const popularRestaurantsRaw = await Reservation.findAll({
            attributes: [
                'restaurantId',
                [sequelize.fn('COUNT', sequelize.col('restaurantId')), 'reservationCount']
            ],
            include: [{
                model: Restaurant,
                attributes: ['name']
            }],
            group: ['Reservation.restaurantId', 'Restaurant.id', 'Restaurant.name'],
            order: [[sequelize.fn('COUNT', sequelize.col('restaurantId')), 'DESC']],
            limit: 3
        });

        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'isVerified', 'createdAt']
        });

        const popularRestaurantsFormatted = popularRestaurantsRaw.map(r => ({
            name: r.Restaurant ? r.Restaurant.name : 'Unknown Restaurant',
            count: r.get('reservationCount')
        }));

        // Provide the expected 'stats' and 'recentActivity' objects for the EJS view
        const viewData = {
            user: req.session.user,
            users: users,
            stats: {
                totalUsers: totalUsers,
                totalOrders: 0, // Placeholder, update if you have orders
                totalRevenue: 0.0 // Placeholder, update if you have revenue
            },
            totalUsers,
            totalRestaurants,
            popularRestaurants: popularRestaurantsFormatted,
            recentActivity: [], // Placeholder, update if you have recent activity
            success: req.query.success,
            error: req.query.error
        };
        res.render('admin/dashboard', viewData);
    } catch (error) {
        console.error('Error fetching data for admin dashboard:', error);
        res.render('admin/dashboard', {
            user: req.session.user,
            users: [],
            stats: {
                totalUsers: 0,
                totalOrders: 0,
                totalRevenue: 0.0
            },
            totalUsers: 0,
            totalRestaurants: 0,
            popularRestaurants: [],
            recentActivity: [],
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

        await userToDelete.destroy();
        return res.redirect('/admin/dashboard?success=User deleted successfully.');

    } catch (error) {
        console.error('Error deleting user:', error);
        return res.redirect(`/admin/dashboard?error=Error deleting user: ${error.message}`);
    }
};
