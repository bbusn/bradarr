const { DataTypes } = require('sequelize');
const sequelize = require('../../database/database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  value: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'settings',
});

module.exports = Setting;