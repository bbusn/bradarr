const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'settings',
});

module.exports = Setting;