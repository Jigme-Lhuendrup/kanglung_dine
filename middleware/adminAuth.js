const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        console.log('Admin auth failed:', {
            session: req.session,
            user: req.session.user
        });
        res.redirect('/auth/login?error=Admin access required');
    }
};

module.exports = isAdmin; 
