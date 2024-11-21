const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: false,
});

sequelize.authenticate()
        .then(() => console.log('Database connected...'))
        .catch(err => console.log('Error: ' + err));

module.exports = sequelize;