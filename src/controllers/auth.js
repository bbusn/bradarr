const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { createLog } = require('./logs');
const { decrypt, encrypt, generateEncryptionKeys } = require('../utils/encryption');

const Attempt = require('../models/Attempt');
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');
const Secret = require('../models/Secret');
const Setting = require('../models/Setting');

exports.loginView = (req, res) => {
    return res.render('login');
};

exports.login = async (req, res) => {
    const ip = req.ip;

    const [maxLoginAttempts, maxLoginAttemptsTimeframe, secrets] = await Promise.all([
        Setting.findOne({ where: { name: 'maxLoginAttempts' } }),
        Setting.findOne({ where: { name: 'maxLoginAttemptsTimeframe' } }),
        Secret.findAll({
            where: {
                name: {
                    [Op.in]: ['jwtSecret', 'jwtRefreshSecret', 'accessTokenName', 'refreshTokenName']
                }
            }
        })
    ]);

    const secretMap = {};
    for (const secret of secrets) {
        secretMap[secret.name] = decrypt(secret.value);
    }
    
    const { jwtSecret, jwtRefreshSecret, accessTokenName, refreshTokenName } = secretMap;

    const username = req.body.username;
    const password = req.body.password;

    try {
        await Attempt.destroy({
            where: {
                createdAt: {
                    [Op.lt]: new Date(Date.now() - maxLoginAttemptsTimeframe.value * 60000)
                }
            }
        });

        const attemptsCount = await Attempt.count({ where: { ip } });
        if (attemptsCount >= maxLoginAttempts.value) {
            req.session.alerts = {
                error: ['Too many login attempts, please try again later']
            };
            return res.redirect('/auth/login');
        }

        if (!username || !password) {
            await Attempt.create({ ip });
            req.session.alerts = {
                error: ['Missing username or password']
            };
            return res.redirect('/auth/login');
        }

        const user = await User.findOne({ where: { username } });
        if (!user) {
            await Attempt.create({ ip });
            req.session.alerts = {
                error: ['Invalid username or password']
            };
            return res.redirect('/auth/login');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            await Attempt.create({ ip });
            req.session.alerts = {
                error: ['Invalid username or password']
            };
            return res.redirect('/auth/login');
        }

        const userData = {
            id: user.id,
            username: user.username
        };

        const accessToken = jwt.sign({ user: userData }, jwtSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ user: userData }, jwtRefreshSecret, { expiresIn: '1d' });

        res.cookie(accessTokenName, accessToken, {
            httpOnly: true,
            maxAge: 900000,
            secure: true,
            sameSite: 'Strict'
        });

        res.cookie(refreshTokenName, refreshToken, {
            httpOnly: true,
            maxAge: 86400000,
            secure: true,
            sameSite: 'Strict'
        });

        req.session.alerts = {
            success: [`Logged in, welcome ${user.username}`]
        };

        return res.redirect('/');
    } catch (err) {
        console.error(err);
        req.session.alerts = {
            error: ['Internal server error']
        };
        return res.redirect('/auth/login');
    }
};

exports.getLogout = async (req, res) => {
    const logout = await this.logout(req, res);

    if (logout) {
        req.session.alerts = {
            success: ['Logged out successfully, see you soon!']
        };
    } else {
        req.session.alerts = {
            error: ['Internal server error while logging out']
        };
    }

    return res.redirect('/auth/login');
};

exports.logout = async (req, res) => {
    try {
        const secrets = await Secret.findAll({
            where: {
                name: {
                    [Op.in]: ['accessTokenName', 'refreshTokenName']
                }
            }
        });

        const secretMap = {};
        for (const secret of secrets) {
            secretMap[secret.name] = decrypt(secret.value);
        }

        const { accessTokenName, refreshTokenName } = secretMap;

        const accessToken = req.cookies[accessTokenName];
        const refreshToken = req.cookies[refreshTokenName];

        if (accessToken) await Blacklist.create({ token: accessToken });
        if (refreshToken) await Blacklist.create({ token: refreshToken });

        res.clearCookie(accessTokenName);
        res.clearCookie(refreshTokenName);

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

exports.iniatilizeSecrets = async () => {
    try {
        generateEncryptionKeys();

        const secrets = await Secret.findAll({
            where: {
                name: {
                    [Op.in]: ['jwtSecret', 'jwtRefreshSecret', 'accessTokenName', 'refreshTokenName']
                }
            }
        });

        if (secrets.length === 4) {
            createLog('Info', 'Using existing secrets found in database', 'initializeSecrets');
            return;
        }
    
        const jwtSecret = encrypt(crypto.randomBytes(64).toString('hex'));
        const jwtRefreshSecret = encrypt(crypto.randomBytes(64).toString('hex'));
        const accessTokenName = encrypt(crypto.randomBytes(4).toString('hex'));
        const refreshTokenName = encrypt(crypto.randomBytes(4).toString('hex'));

        await Secret.bulkCreate([
            { name: 'jwtSecret', value: jwtSecret },
            { name: 'jwtRefreshSecret', value: jwtRefreshSecret },
            { name: 'accessTokenName', value: accessTokenName },
            { name: 'refreshTokenName', value: refreshTokenName },
        ]);

        createLog('Success', 'Secrets initialized and stored in database', 'initializeSecrets');
    } catch (err) {
        console.error(err);
        createLog('Error', 'Error initializing secrets : ' + err, 'initializeSecrets');
        process.exit(1);
    }
};