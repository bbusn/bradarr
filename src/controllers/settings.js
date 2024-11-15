const Setting = require('../models/Setting');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logController = require('./log');
const { Op } = require('sequelize');

exports.isSetup = async () => {
    try {
        const setup = await Setting.findOne({ where: { name: 'setup' } });
        return setup.value;
    } catch (err) {
        logController.createLog('Error', 'Error with setup : ' + err, 'isSetup');
        return false;
    }
}

exports.settingsView = async (req, res) => {
    try {
        let settings = await Setting.findAll({
            where: {
                name: {
                    [Op.notIn]: ['jellyseerrApiKey', 'jellyseerrPassword', 'jellyseerrUsername']
                }
            }
        });
        settings = settings.reduce((acc, setting) => {
            acc[setting.name] = setting.value;
            return acc;
        }, {});
        return res.render('settings', { settings });
    } catch (err) {
        logController.createLog('Error', 'Error getting settings : ' + err, 'settingsView');
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
        logController.createLog('Error', 'Error updating settings : ' + err, 'modifySettings');
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

    const { username, password, jellyseerrUsername, jellyseerrPassword, jellyseerrApiKey } = req.body;

    if (!username || !password || !jellyseerrUsername || !jellyseerrPassword|| !jellyseerrApiKey) {
        req.session.alerts = {
            error: ['Missing fields']
        };
        return res.redirect('/settings/setup');
    }

    try {
        const hashedJellyseerrApiKey = await bcrypt.hash(jellyseerrApiKey, 10);
        const hashedJellyseerrPassword = await bcrypt.hash(jellyseerrPassword, 10);
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.bulkCreate([
            { username, password: hashedPassword }
        ], { updateOnDuplicate: ['password'] });

        let settings = [
            { name: 'setup', value: true },
            { name: 'jellyseerrUsername', value: jellyseerrUsername },
            { name: 'jellyseerrPassword', value: hashedJellyseerrPassword },
            { name: 'jellyseerrApiKey', value: hashedJellyseerrApiKey },
            { name: 'maxLoginAttempts', value: 5 },
            { name: 'maxLoginAttemptsTimeframe', value: 30 },
        ]

        await Setting.bulkCreate(settings, { updateOnDuplicate: ['value'] });

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
        logController.createLog('Error', 'Error getting admin : ' + err, 'adminView');
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
            error: ['Missing fields']
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
        logController.createLog('Error', 'Error updating admin user : ' + err, 'modifyAdmin');
        req.session.alerts = {
            error: ['Internal server error']
        };
        return res.redirect('/settings/admin');
    }
}

exports.modifyJellyseerrView = async (req, res) => {
    try {
        const jellyseerr = await Setting.findOne({ where: { name: ['jellyseerrUsername'] } });
                
        return res.render('modify_jellyseerr', { jellyseerr });
    } catch (err) {
        logController.createLog('Error', 'Error getting jellyseerr : ' + err, 'jellyseerrView');
        req.session.alerts = {
            error: ['Error getting jellyseerr from database']
        };
        return res.redirect('/settings');
    }
}

exports.modifyJellyseerr = async (req, res) => {
    const { username, password, apiKey } = req.body;

    if (!username || !password || !apiKey) {
        req.session.alerts = {
            error: ['Missing fields']
        };
        return res.redirect('/settings/jellyseerr');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedApiKey = await bcrypt.hash(apiKey, 10);

        await Setting.destroy({ where: { name: ['jellyseerrUsername', 'jellyseerrPassword', 'jellyseerrApiKey'] } });

        await Setting.bulkCreate([
            { name: 'jellyseerrUsername', value: username },
            { name: 'jellyseerrPassword', value: hashedPassword },
            { name: 'jellyseerrApiKey', value: hashedApiKey }
        ]);

        req.session.alerts = {
            success: ['Jellyseerr credentials updated']
        };
        return res.redirect('/settings');

    } catch (err) {
        logController.createLog('Error', 'Error updating jellyseerr credentials : ' + err, 'modifyJellyseerr');
        req.session.alerts = {
            error: ['Internal server error']
        };
        return res.redirect('/settings/jellyseerr');
    }
}