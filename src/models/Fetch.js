const { DataTypes } = require('sequelize');
const sequelize = require('../../database/database');

const Fetch = sequelize.define('Fetch', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  method: {
    type: DataTypes.STRING,
  },
  url: {
    type: DataTypes.STRING,
  },
  data: {
    type: DataTypes.TEXT,
  },
  headers: {
    type: DataTypes.STRING,
  },
  source: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  tableName: 'fetchs',
});

module.exports = Fetch;