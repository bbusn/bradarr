const { isSetup } = require('../controllers/settings');
const { logout } = require('../controllers/auth');

exports.setupMiddleware = async (req, res, next) => {
    const setup = await isSetup(req);

    if (!setup) {
        await logout(req, res);
        if (req.path === '/settings/setup') return next();
        return res.redirect('/settings/setup');
    } 

    if (req.path === '/settings/setup') {
        req.session.alerts = {
            error: ['Application has already been setup, go to settings to change configuration']
        };
        return res.redirect('/');
    }
    next();
};