const Fetch = require('../models/Fetch');
const { createLog } = require('./logs');
const sequelize = require('../database');

exports.fetchsView = async (req, res) => {  
    const { user } = req.user;
    const { username } = user;
    
    res.render('fetchs', { user: { 
        username,
    }});
};

exports.createFetch = async (method, url, data, headers, source) => {
    try {
        await Fetch.create({
            method,
            url,
            data,
            headers,
            source,
        });
    } catch (err) {
        console.log('Error creating Fetch : ' + err);
        createLog('Error', 'Error creating Fetch : ' + err, 'createFetch');
    }
}


exports.getFetchs = async (req, res) => {
    try {
        const fetchs = await Fetch.findAll({
            order: [['id', 'DESC']],
        });
        return res.status(200).json(fetchs);
    } catch (err) {
        createLog('Error', 'Error getting fetchs : ' + err, 'getFetchs');
        return res.status(500).json({ error: 'Error getting fetchs' });
    }
}


exports.getLatestFetchs = async (req, res) => {
    try {
        const fetchs = await Fetch.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10,
        });
        return res.status(200).json(fetchs);
    } catch (err) {
        createLog('Error', 'Error getting latest fetchs : ' + err, 'getLatestFetchs');
        return res.status(500).json({ error: 'Error getting latest fetchs' });
    }
}

exports.deleteFetchs = async (req, res) => {
    try {
        const fetchs = await Fetch.findAll({
            order: [['createdAt', 'DESC']],
            offset: 2000,
        });
        await Fetch.destroy({
            where: {
                id: fetchs.map(fetch => fetch.id),
            },
        });
        await sequelize.query('DELETE FROM sqlite_sequence WHERE name = "fetchs";');

        createLog('Success', 'Deleted oldest fetchs to maintain table clean', 'deleteFetchs');
    } catch (err) {
        createLog('Error', 'Error deleting fetchs : ' + err, 'deleteFetchs');
    }
}

exports.emptyFetchs = async (req, res) => {
    try {
        await Fetch.drop(); 
        await sequelize.query('DELETE FROM sqlite_sequence WHERE name = "fetchs";');
        await Fetch.sync();

        createLog('Success', 'Fetchs table emptied', 'emptyFetchs');
        return res.status(200).json({ message: 'Fetchs table emptied' });
    } catch (err) {
        createLog('Error', 'Error emptying fetchs : ' + err, 'emptyFetchs');
        return res.status(500).json({ error: 'Error emptying fetchs' });
    }
}