const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const Attempt = require('../models/Attempt');
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');
const Setting = require('../models/Setting');

exports.loginView = (req, res) => {    
    return res.render('login');
};

exports.login = async (req, res) => {
    const ip = req.ip;
    
    const settings = await Setting.findAll({ 
        name: { [Op.in]: ['maxLoginAttempts', 'maxLoginAttemptsTimeframe'] } 
    })

    const maxAttempts = settings.find(s => s.name === 'maxLoginAttempts')?.value || 5;
    const maxAttemptsTimeframe = settings.find(s => s.name === 'maxLoginAttemptsTimeframe')?.value || 30;
    
    const username = req.body.username;
    const password = req.body.password; 

    try {
        await Attempt.destroy({ 
            where: { 
                createdAt: { 
                    [Op.lt]: new Date(Date.now() - maxAttemptsTimeframe * 60000)
                } 
            }
        });

        const attemptsCount = await Attempt.count({ where: { ip } });
          
        if (attemptsCount >= maxAttempts) {
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
            username: user.username,
        };

        const token = jwt.sign({ user: userData }, process.env.JWT_SECRET, { expiresIn: '4h' });
        res.cookie('token', token, { httpOnly: true });

        req.session.alerts = {
            success: ['Logged in, welcome ' + user.username]
        };

        return res.redirect('/');
    } catch (err) {
        console.log(err);
        req.session.alerts = {
            error: ['Internal server error']
        };
        return res.redirect('/auth/login');
    }
};

exports.logout = (req, res) => {
    let token = req.cookies.token;
    Blacklist.create({ token });
    res.clearCookie('token');
    req.session.alerts = {
        success: ['Logged out, see you soon!']
    };
    return res.redirect('/auth/login');
};