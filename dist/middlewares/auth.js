const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Secret = require('../models/Secret');
const Blacklist = require('../models/Blacklist');
const { Op } = require('sequelize');
const { decrypt } = require('../utils/encryption');

const clearCookies = async (res, accessTokenName, refreshTokenName, accessToken, refreshToken) => {
    res.clearCookie(accessTokenName);
    res.clearCookie(refreshTokenName);

    if (accessToken) await Blacklist.create({ token: accessToken });
    if (refreshToken) await Blacklist.create({ token: refreshToken });
};

exports.authMiddleware = async (req, res, next) => {
    try {
        const secrets = await Secret.findAll({
            where: {
                name: {
                    [Op.in]: ['jwtSecret', 'jwtRefreshSecret', 'accessTokenName', 'refreshTokenName']
                }
            }
        });

        const secretMap = {};
        for (const secret of secrets) {
            secretMap[secret.name] = decrypt(secret.value);
        }

        const { jwtSecret, jwtRefreshSecret, accessTokenName, refreshTokenName } = secretMap;

        const accessToken = req.cookies[accessTokenName];
        const refreshToken = req.cookies[refreshTokenName];
        
        if (!accessToken) {
            if (['/auth/login', '/settings/setup'].includes(req.url)) {
                await clearCookies(res, accessTokenName, refreshTokenName, accessToken, refreshToken);
                return next();
            }
            req.session.alerts = {
                error: ['You must login to use the application']
            };
            return res.redirect('/auth/login');
        }

        const blacklisted = await Blacklist.findOne({ where: { token: accessToken } });
        if (blacklisted) {
            await clearCookies(res, accessTokenName, refreshTokenName, accessToken, refreshToken);
            return res.redirect('/auth/login');
        }

        jwt.verify(accessToken, jwtSecret, async (err, user) => {
            if (err) {
                if (!refreshToken) {
                    await clearCookies(res, accessTokenName, refreshTokenName, accessToken, refreshToken);
                    req.session.alerts = {
                        error: ['Session expired, please login again']
                    };
                    return res.redirect('/auth/login');
                }

                jwt.verify(refreshToken, jwtRefreshSecret, async (refreshErr, refreshUser) => {
                    if (refreshErr) {
                        await clearCookies(res, accessTokenName, refreshTokenName, accessToken, refreshToken);
                        req.session.alerts = {
                            error: ['Session expired, please login again']
                        };
                        return res.redirect('/auth/login');
                    }

                    await Blacklist.create({ token: accessToken });

                    const newAccessToken = jwt.sign({ user: refreshUser }, jwtSecret, { expiresIn: '15m' });

                    res.cookie(accessTokenName, newAccessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'Strict',
                        maxAge: 15 * 60 * 1000
                    });

                    req.user = refreshUser;
                    return next();
                });
            } else {
                req.user = user;
                return next();
            }
        });
    } catch (error) {
        console.error('Internal server error in authMiddleware : ', error);
        await clearCookies(res, accessTokenName, refreshTokenName, accessToken, refreshToken);
        req.session.alerts = {
            error: ['Something went wrong, please try again later.']
        };
        return res.redirect('/auth/login');        
    }
};
