const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        if (req.url === '/auth/login' || req.url === '/settings/setup') {
            if (req.session) {
                req.session.destroy();
            }
            res.clearCookie('token');
            return next();
        } else {
            return res.redirect('/auth/login');
        }
    } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.redirect('/auth/login');
            }
            if (req.url === '/auth/login') {
                return res.redirect('/');
            }
            req.user = user;
            return next();
        });
    }
};