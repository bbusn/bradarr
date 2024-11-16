const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csurf = require('csurf');
const helmet = require('helmet');
const csrfProtection = csurf({ cookie: true });
const sequelize = require('./database/database');

// const { scanM3u8Folder, getProgress } = require('./app/controllers/downloadController');
// const { scanJellyseerr, getConnectSID } = require('./app/controllers/movieController');
const { deleteFetchs } = require('./src/controllers/fetchs');
const { iniatilizeSecrets } = require('./src/controllers/auth');
const { deleteLogs } = require('./src/controllers/logs');

const authRoutes = require('./src/routes/auth');
const logsRoutes = require('./src/routes/logs');
const fetchsRoutes = require('./src/routes/fetchs');
const homeRoutes = require('./src/routes/home');
const settingsRoutes = require('./src/routes/settings');
const apiRoutes = require('./src/routes/api');

// const movieRoutes = require('./app/routes/movieRoutes');

const { localsMiddleware } = require('./src/middlewares/locals');
const { setupMiddleware } = require('./src/middlewares/setup');
const { authMiddleware } = require('./src/middlewares/auth');
const { xssMiddleware } = require('./src/middlewares/xss');

const app = express();

sequelize.sync({ force: false })
    .then(() => {
        console.log('Models synchronized with the database');
        console.log("\x1b[38;5;208m..................................................................\x1b[0m");
        iniatilizeSecrets();
        // getConnectSID();
        // verifyPublicIp();

        // scanM3u8Folder();
        // scanJellyseerr();               
        deleteLogs();
        deleteFetchs();
    })
    .catch(err => console.log('Error syncing : ' + err));

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.set('trust proxy', true);
app.disable('x-powered-by');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(cookieParser());
app.use(xssMiddleware);
app.use(csrfProtection);

app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 86400000 },
    resave: true,
    saveUninitialized: true
}));

app.use(localsMiddleware);
app.use(setupMiddleware);
app.use(authMiddleware);

// Routes
app.use('/', homeRoutes);
app.use('/api', apiRoutes);
app.use('/settings', settingsRoutes);
app.use('/auth', authRoutes);
app.use('/logs', logsRoutes);
app.use('/fetchs', fetchsRoutes);
// app.use('/', movieRoutes);

// app.get('/progress/:id', getProgress);

app.get('*', function(req, res){
    res.status(404).render('error', { 
        error: {
            code: '404',
            message: 'The page you are looking for does not exist.',
        }, 
        navigation: true
    });
});

// Server
const PORT = process.env.PORT || 6789;

app.listen(PORT, () => {
    console.clear();
    console.log(`\x1b[38;5;208m_____________________    BRADARR SERVER    ______________________\x1b[0m`);
    console.log("\x1b[38;5;208m..................................................................\x1b[0m");
    // setInterval(verifyPublicIp, 120000);
    // setInterval(scanM3u8Folder, 25000);
    // setInterval(scanJellyseerr, 25000);  
    setInterval(deleteLogs, 240000);
    setInterval(deleteFetchs, 240000);
    // setInterval(getConnectSID, 1920000);
});
