const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ExternalRequest = sequelize.define('ExternalRequest', {
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
  tableName: 'external-requests',
});

module.exports = ExternalRequest;