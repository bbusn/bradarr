const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  monitored: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.STRING, //Pending, Linked, Streamed, Downloading, 1vailable, Unavailable, Failed
    defaultValue: 'Pending',
  },
  year: {
    type: DataTypes.INTEGER,
  },
  file: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  poster: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  tableName: 'movies',
});


// Foreign Key

module.exports = Movie;