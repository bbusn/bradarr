const express = require('express');
const cookieParser = require('cookie-parser');
const sequelize = require('./database/database');

// const { scanM3u8Folder, getProgress } = require('./app/controllers/downloadController');
// const { scanJellyseerr, getConnectSID } = require('./app/controllers/movieController');
// const { deleteRequests, deleteExternalRequests } = require('./app/controllers/requestController');
const { deleteLogs } = require('./src/controllers/log');

// const authRoutes = require('./app/routes/authRoutes');
// const appRoutes = require('./app/routes/appRoutes');
// const movieRoutes = require('./app/routes/movieRoutes');

// const { authMiddleware } = require('./app/middlewares/authMiddleware');
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

// Middleware
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('public'));

app.set('trust proxy', true);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use(authMiddleware);

// const { createAccount } = require('./app/controllers/createController');

// app.use(loggingRequestMiddleware);

// Routes
// app.use('/', authRoutes);
// app.use('/', appRoutes);
// app.use('/', movieRoutes);

// app.get('/progress/:id', getProgress);

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
