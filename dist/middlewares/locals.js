exports.localsMiddleware = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    if (req.session.alerts) res.locals.alerts = req.session.alerts;
    if (!res.locals.alerts) res.locals.alerts = false;
    delete req.session.alerts;
    next();
};