const { DataTypes } = require('sequelize');
const sequelize = require('../../database/database');

const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.STRING, // Success, Error, Warning, Info, Request
    defaultValue: 'Info',
  },
  message: {
    type: DataTypes.TEXT,
  },
  source: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  tableName: 'logs',
});


module.exports = Log;