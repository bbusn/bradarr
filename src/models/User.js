const { DataTypes } = require('sequelize');
const sequelize = require('../../database/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        max: 15,
        min: 5,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        max: 25,
        min: 8,
        allowNull: false,
    },
}, {
    timestamps: true,  
    tableName: 'users', 
});

module.exports = User;
