const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const sequelize = require('./database/database');

// const { scanM3u8Folder, getProgress } = require('./app/controllers/downloadController');
// const { scanJellyseerr, getConnectSID } = require('./app/controllers/movieController');
// const { deleteRequests, deleteExternalRequests } = require('./app/controllers/requestController');
const { deleteLogs } = require('./src/controllers/log');

const authRoutes = require('./src/routes/auth');
const homeRoutes = require('./src/routes/home');
const settingsRoutes = require('./src/routes/settings');
// const movieRoutes = require('./app/routes/movieRoutes');

const { setupMiddleware } = require('./src/middlewares/setup');
const { authMiddleware } = require('./src/middlewares/auth');
// const { loggingRequestMiddleware } = require('./app/middlewares/loggingRequestMiddleware');

const app = express();


sequelize.sync({ force: false })
    .then(() => {
        console.log('Models synchronized with the database');
        console.log("\x1b[38;5;208m..................................................................\x1b[0m");
        // verifyPublicIp();
        
        // createAccount();
        // getConnectSID();

        // scanM3u8Folder();
        // scanJellyseerr();               
        deleteLogs();
        // deleteRequests(); 
        // deleteExternalRequests();
    })
    .catch(err => console.log('Error syncing : ' + err));

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.set('trust proxy', true);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 86400000 },
    resave: true,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    if (req.session.alerts) res.locals.alerts = req.session.alerts;
    if (!res.locals.alerts) res.locals.alerts = {};
    delete req.session.alerts;
    next();
});

app.use(setupMiddleware);
app.use(authMiddleware);

// const { createAccount } = require('./app/controllers/createController');

// app.use(loggingRequestMiddleware);

// Routes
app.use('/', homeRoutes);
app.use('/settings', settingsRoutes);
app.use('/auth', authRoutes);
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
const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 6789;

const JELLYSEERR_HOST = process.env.JELLYSEERR_HOST || 'http://localhost';
const JELLYSEERR_PORT = process.env.JELLYSEERR_PORT || 5055;

app.listen(PORT, () => {
    console.clear();
    console.log(`\x1b[38;5;208m_____________________    BRADARR SERVER    ______________________\x1b[0m`);
    console.log("\x1b[38;5;208m..................................................................\x1b[0m");
    console.log(`\x1b[90m- Server is running on ${HOST}`);
    console.log(`\x1b[90m- Jellyseerr is running on ${JELLYSEERR_HOST}:${JELLYSEERR_PORT}`);
    console.log("\x1b[38;5;208m..................................................................\x1b[0m");
    console.log(`\x1b[38;5;208m_________________________________________________________________\x1b[0m`);

    // setInterval(verifyPublicIp, 120000);
    // setInterval(scanM3u8Folder, 25000);
    // setInterval(scanJellyseerr, 25000);  
    setInterval(deleteLogs, 240000);
    // setInterval(deleteRequests, 240000);
    // setInterval(deleteExternalRequests, 240000);
    // setInterval(getConnectSID, 1920000);
});
