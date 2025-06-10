const { User, Restaurant, Reservation, sequelize } = require('../models'); // Import necessary models and sequelize

exports.getDashboard = async (req, res) => {
    try {
        console.log('Fetching admin dashboard data...');
        
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

        // Format users data to include status
        const formattedUsers = users.map(user => ({
            ...user.toJSON(),
            status: user.isVerified ? 'Verified' : 'Unverified'
        }));

        const popularRestaurantsFormatted = popularRestaurantsRaw.map(r => ({
            name: r.Restaurant ? r.Restaurant.name : 'Unknown Restaurant',
            count: r.get('reservationCount')
        }));

        // Create recent activity data
        const recentActivity = [
            {
                icon: 'users',
                description: `${totalUsers} total users registered`,
                time: 'Just now'
            },
            {
                icon: 'shopping-bag',
                description: `${totalRestaurants} restaurants registered`,
                time: 'Just now'
            }
        ];

        const viewData = {
            user: req.session.user,
            users: formattedUsers,
            stats: {
                totalUsers: totalUsers,
                totalOrders: 0,
                totalRevenue: 0.0
            },
            totalUsers,
            totalRestaurants,
            popularRestaurants: popularRestaurantsFormatted,
            recentActivity,
            success: req.query.success,
            error: req.query.error
        };

        console.log('Rendering admin dashboard with data:', {
            totalUsers,
            totalRestaurants,
            userCount: formattedUsers.length
        });

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
