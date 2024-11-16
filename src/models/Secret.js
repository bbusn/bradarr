const { DataTypes } = require('sequelize');
const sequelize = require('../../database/database');

const Secret = sequelize.define('Secret', {
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
  tableName: 'secrets',
});

module.exports = Secret;