const isOwner = (req, res, next) => {
    console.log('Checking owner authentication:', {
        hasSession: !!req.session,
        hasUser: !!req.session?.user,
        userRole: req.session?.user?.role
    });

    if (req.session.user && req.session.user.role === 'owner') {
        console.log('Owner authentication successful');
        next();
    } else {
        console.log('Owner authentication failed');
        res.redirect('/auth/login');
    }
};

module.exports = isOwner; 