const { isSetup } = require('../controllers/settings');

exports.setupMiddleware = async (req, res, next) => {
    const setup = await isSetup();
    if (!setup && req.path !== '/settings/setup') {
        return res.redirect('/settings/setup');
    } else if (req.path === '/settings/setup' && setup) {
        return res.redirect('/');
    }
    next();
};