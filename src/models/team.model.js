const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Team = sequelize.define('team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  imgUrl: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  contact_number: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  },
  pincode: {
    type: DataTypes.INTEGER,
  },
  gender: {
    type: DataTypes.STRING,
    validate: {
      isIn: [['Male', 'Female']],
    },
  },
  birthDay: {
    type: DataTypes.DATE,
  },
  rating: {
    type: DataTypes.FLOAT,
  },
  location: {
    type: DataTypes.STRING,
  },
  points: {
    type: DataTypes.STRING,
  },
  deviceToken: {
    type: DataTypes.STRING,
  },
})

module.exports = { Team }
