const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Blacklist = sequelize.define('Blacklist', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'blacklist',
});

module.exports = Blacklist;