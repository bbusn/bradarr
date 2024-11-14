const Setting = require('../models/Setting');
const logController = require('./log');

exports.settingsView = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        res.render('settings', { settings });
    } catch (err) {
        logController.createLog('Error', 'Error getting settings : ' + err, 'settingsView');
        res.render('error', { error: 'Error getting settings' });
    }
}