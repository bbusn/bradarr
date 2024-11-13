const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const InternalRequest = sequelize.define('InternalRequest', {
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
  ip: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  tableName: 'internal-requests',
});

module.exports = InternalRequest;