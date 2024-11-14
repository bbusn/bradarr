const { DataTypes } = require('sequelize');
const sequelize = require('../../database/database');

const Attempt = sequelize.define('Attempt', {
  id: {
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: 'attempts',
});

module.exports = Attempt;