const Setting = require('../models/Setting');
const Secret = require('../models/Secret');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { decrypt, encrypt } = require('../utils/encryption');
const { createLog } = require('./logs');
const { Op } = require('sequelize');

exports.isSetup = async (req) => {
    try {
        const setup = await Setting.findOne({ where: { name: 'setup' } });
        if (!setup) {
            req.session.alerts = {
                error: ['Please complete the setup before using the app']
            };
            createLog('Info', 'Setup not found, please complete the setup before using the app', 'isSetup');
            return false;
        }
        if (setup.value !== '1') {
            req.session.alerts = {
                error: ['Setup is incorrect, please complete the setup before using the app']
            };
            return false;
        }
        return true;
    } catch (err) {
        createLog('Error', 'Error with setup : ' + err, 'isSetup');
        return false;
    }
}

exports.settingsView = async (req, res) => {
    try {
        let settings = await Setting.findAll({
            where: {
                name: {
                    [Op.notIn]: ['jellyseerrUsername', 'jellyseerrApiUrl', 'jellyseerrPort', 'setup']
                }
            }
        });
        settings = settings.reduce((acc, setting) => {
            acc[setting.name] = setting.value;
            return acc;
        }, {});
        return res.render('settings', { settings });
    } catch (err) {
        createLog('Error', 'Error getting settings : ' + err, 'settingsView');
        req.session.alerts = {
            error: ['Error getting settings : ' + err]
        };
        return res.redirect('/');
    }
}

exports.modifySettings = async (req, res) => {
    const settings = req.body;

    try {
        await Setting.bulkCreate(Object.keys(settings).map(name => ({ name, value: settings[name] })), {
            updateOnDuplicate: ['value']
        });
        req.session.alerts = {
            success: ['Settings updated']
        };
        return res.redirect('/settings');
    } catch (err) {
        createLog('Error', 'Error updating settings : ' + err, 'modifySettings');
        req.session.alerts = {
            error: ['Internal server error']
        };
        return res.redirect('/settings');
    }
}

exports.setupView = async (req, res) => {
    return res.render('setup');
}

exports.setup = async (req, res) => {

    const { username, password,confirmPassword, jellyseerrUsername, jellyseerrPassword, jellyseerrApiKey, jellyseerrApiUrl, jellyseerrPort } = req.body;

    if (!username || !password || !confirmPassword || !jellyseerrUsername || !jellyseerrPassword|| !jellyseerrApiKey || !jellyseerrApiUrl || !jellyseerrPort) {
        req.session.alerts = {
            error: ['Missing fields']
        };
        return res.redirect('/settings/setup');
    }

    if (password !== confirmPassword) {
        req.session.alerts = {
            error: ['Passwords do not match']
        };
        return res.redirect('/settings/setup');
    }

    if (!jellyseerrApiUrl.match(/^(http|https):\/\/[^ "]+$/)) {
        req.session.alerts = {
            error: ['Invalid Jellyseerr API URL']
        };
        return res.redirect('/settings/setup');
    }

    try {

        const hashedJellyseerrApiKey = encrypt(jellyseerrApiKey);
        const hashedJellyseerrPassword = encrypt(jellyseerrPassword);

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.bulkCreate([
            { username, password: hashedPassword }
        ], { updateOnDuplicate: ['password'] });

        let settings = [
            { name: 'setup', value: true },
            { name: 'jellyseerrUsername', value: jellyseerrUsername },
            { name: 'jellyseerrApiUrl', value: jellyseerrApiUrl },
            { name: 'jellyseerrPort', value: jellyseerrPort },
            { name: 'maxLoginAttempts', value: 5 },
            { name: 'maxLoginAttemptsTimeframe', value: 30 },
            { name: 'maxMonitoredMovies', value: 8 },
        ]

        let secrets = [
            { name: 'jellyseerrPassword', value: hashedJellyseerrPassword },
            { name: 'jellyseerrApiKey', value: hashedJellyseerrApiKey }
        ]

        await Setting.bulkCreate(settings, { updateOnDuplicate: ['value'] });
        await Secret.bulkCreate(secrets, { updateOnDuplicate: ['value'] });

        req.session.alerts = {
            success: ['Setup complete now you can login !']
        };
        return res.redirect('/auth/login');
        
    } catch (err) {
        console.log(err);
        req.session.alerts = {
            error: ['Internal server error']
        };
        return res.redirect('/settings/setup');
    }
}

exports.modifyAdminView = async (req, res) => {
    try {
        const admin = await User.findOne();
        return res.render('modify_admin', { admin: admin });
    } catch (err) {
        createLog('Error', 'Error getting admin : ' + err, 'adminView');
        req.session.alerts = {
            error: ['Error getting admin from database']
        };
        return res.redirect('/settings');
    }
}
exports.modifyAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        req.session.alerts = {
            error: ['Missing username or password']
        };
        return res.redirect('/settings/admin');
    }

    try {
        const admin = await User.findOne({ where: { username } });
        const hashedPassword = await bcrypt.hash(password, 10);

        if (!admin) {
            await User.destroy({ where: {} });
            await User.create({ username, password: hashedPassword });
        } else {
            await User.update({ password: hashedPassword }, { where: { username } });
        }

        req.session.alerts = {
            success: ['Admin user updated']
        };
        return res.redirect('/settings');

    } catch (err) {
        createLog('Error', 'Error updating admin user : ' + err, 'modifyAdmin');
        req.session.alerts = {
            error: ['Internal server error']
        };
        return res.redirect('/settings/admin');
    }
}

exports.modifyJellyseerrView = async (req, res) => {
    try {
        let jellyseerr = await Setting.findAll({ 
            where: { 
            name: ['jellyseerrUsername', 'jellyseerrPort', 'jellyseerrApiUrl'] 
            } 
        });

        jellyseerr = jellyseerr.reduce((acc, setting) => {
            acc[setting.name] = setting.value;
            return acc;
        }, {});
        
        return res.render('modify_jellyseerr', { jellyseerr });
    } catch (err) {
        createLog('Error', 'Error getting jellyseerr : ' + err, 'jellyseerrView');
        req.session.alerts = {
            error: ['Error getting jellyseerr from database : ' + err]
        };
        return res.redirect('/settings');
    }
}

exports.modifyJellyseerr = async (req, res) => {
    let { jellyseerrApiKey, jellyseerrPort, jellyseerrApiUrl, jellyseerrPassword, jellyseerrUsername } = req.body;

    if (jellyseerrApiUrl) {
        if (!jellyseerrApiUrl.match(/^(http|https):\/\/[^ "]+$/)) {
            req.session.alerts = {
                error: ['Invalid Jellyseerr API URL']
            };
            return res.redirect('/settings/jellyseerr');
        }
    }

    try {
        if (jellyseerrPassword) {
            const hashedPassword = encrypt(jellyseerrPassword);
            jellyseerrPassword = hashedPassword;
        }

        if (jellyseerrApiKey) {
            const hashedApiKey = encrypt(jellyseerrApiKey);
            jellyseerrApiKey = hashedApiKey;
        }

        const settings = [
            { name: 'jellyseerrUsername', value: jellyseerrUsername },
            { name: 'jellyseerrPort', value: jellyseerrPort },
            { name: 'jellyseerrApiUrl', value: jellyseerrApiUrl }
        ];

        const secrets = [
            { name: 'jellyseerrPassword', value: jellyseerrPassword },
            { name: 'jellyseerrApiKey', value: jellyseerrApiKey }
        ];

        await Setting.bulkCreate(settings, { updateOnDuplicate: ['value'] });
        await Secret.bulkCreate(secrets, { updateOnDuplicate: ['value'] });

        req.session.alerts = {
            success: ['Jellyseerr settings updated']
        };
        return res.redirect('/settings');

    } catch (err) {
        createLog('Error', 'Error updating jellyseerr settings : ' + err, 'modifyJellyseerr');
        req.session.alerts = {
            error: ['Internal server error']
        };
        return res.redirect('/settings/jellyseerr');
    }
}