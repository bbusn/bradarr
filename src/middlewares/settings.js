const { isSetup } = require('../controllers/settings');

exports.setupMiddleware = (req, res, next) => {
    if (!isSetup && req.path !== '/settings/setup') {
        return res.redirect('/settings/setup');
    } else if (req.path === '/settings/setup' && isSetup) {
        return res.redirect('/');
    }
    next();
};