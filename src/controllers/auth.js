const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const Attempt = require('../models/Attempt');
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');

exports.loginView = (req, res) => {
    res.render('login');
};

exports.login = async (req, res) => {
    const ip = req.ip;
    const maxAttempts = process.env.MAX_LOGIN_ATTEMPTS || 5;
    const maxAttemptsTimeframe = process.env.MAX_LOGIN_ATTEMPTS_TIMEFRAME || 30;
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
            return res.status(400).render('error', {  
                error: {
                    code: '429',
                    message: 'Too many attempts',
                },
                navigation: false
            }); 
        }

        if (!username || !password) {
            await Attempt.create({ ip });
            return res.status(400).render('error', {  
                error: {
                    code: '400',
                    message: 'Missing username or password',
                }, 
                navigation: false
            }); 
        }

        const user = await User.findOne({ where: { username } });
        if (!user) {
            await Attempt.create({ ip });
            return res.status(400).json({ error: 'Invalid username or password ' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            await Attempt.create({ ip });
            return res.status(400).render('error', {  
                error: {
                    code: '400',
                    message: 'Invalid username or password',        
                },
                navigation: false
            });
        }

        const userData = {
            id: user.id,
            username: user.username,
        };

        const token = jwt.sign({ user: userData }, process.env.JWT_SECRET, { expiresIn: '4h' });
        res.cookie('token', token, { httpOnly: true });
        
        return res.redirect('/');
    } catch (err) {
        console.log(err);
        logController.createLog('Error', 'Error logging in : ' + err, 'login');
        return res.status(500).render('error', {  
            error: {
                code: '500',
                message: 'Internal server error', 
            },
            navigation: false
        });
    }
};

exports.logout = (req, res) => {
    let token = req.cookies.token;
    Blacklist.create({ token });
    res.clearCookie('token');
    return res.redirect('/auth/login');
};