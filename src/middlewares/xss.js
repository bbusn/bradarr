const xss = require('xss');

exports.xssMiddleware = (req, res, next) => {
    for (let key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            req.body[key] = xss(req.body[key]);
        }
    }
    next();
}