const Setting = require('../models/Setting');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logController = require('./log');

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
        const settings = await Setting.findAll();
        return res.render('settings', { settings });
    } catch (err) {
        logController.createLog('Error', 'Error getting settings : ' + err, 'settingsView');
        res.locals.alerts = {
            error: ['Error getting settings']
        };
        return res.render('settings');
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

        await User.create({ username, password: hashedPassword });

        let settings = [
            { name: 'setup', value: true },
            { name: 'jellyseerrUsername', value: jellyseerrUsername },
            { name: 'jellyseerrPassword', value: hashedJellyseerrPassword },
            { name: 'jellyseerrApiKey', value: hashedJellyseerrApiKey },
        ]

        await Setting.bulkCreate(settings);
        req.session.alerts = {
            success: ['Setup complete now you can login']
        };
        return res.redirect('/');
    } catch (err) {
        console.log(err);
        req.session.alerts = {
            error: ['Internal server error']
        };
        return res.redirect('/settings/setup');
    }
}