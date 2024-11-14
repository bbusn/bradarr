const Log = require('../models/Log');
const sequelize = require('../../database/database');
  
exports.createLog = async (status, message, source) => {
    try {
        await Log.create({
            status,
            message,
            source,
        });
    } catch (err) {
        console.log('Error creating log : ' + err);
    }
}

exports.getLogs = async (req, res) => {
    try {
        const logs = await Log.findAll({
            order: [['id', 'DESC']],
        });
        return res.status(200).json(logs);
    } catch (err) {
        this.createLog('Error', 'Error getting logs : ' + err, 'getLogs');
        return res.status(500).json({ error: 'Error getting logs' });
    }
}

exports.getLatestLogs = async (req, res) => {
    try {
        const logs = await Log.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10,
        });
        return res.status(200).json(logs);
    } catch (err) {
        this.createLog('Error', 'Error getting latest logs : ' + err, 'getLatestLogs');
        return res.status(500).json({ error: 'Error getting latest logs' });
    }
}

exports.deleteLogs = async () => {
    try {
        const logs = await Log.findAll({
            order: [['createdAt', 'DESC']],
            offset: 3000,
        });
        await Log.destroy({
            where: {
                id: logs.map(log => log.id),
            },
        });
        await sequelize.query('DELETE FROM sqlite_sequence WHERE name = "logs";');

        this.createLog('Success', 'Deleted oldest logs to maintain logs table clean...', 'deleteLogs');
    } catch (err) {
        this.createLog('Error', 'Error deleting logs : ' + err, 'deleteLogs');
    }
}

exports.emptyLogs = async (req, res) => {
    try {
        await Log.destroy({
            where: {},
            truncate: true,
        });
        await sequelize.query('DELETE FROM sqlite_sequence WHERE name = "logs";');
        this.createLog('Success', 'Logs table emptied', 'emptyLogs');
        return res.status(200).json({ message: 'Logs table emptied' });
    } catch (err) {
        this.createLog('Error', 'Error emptying logs : ' + err, 'emptyLogs');
        return res.status(500).json({ error: 'Error emptying logs' });
    }
}