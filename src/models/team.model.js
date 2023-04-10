const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Team = sequelize.define('team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  imgUrl: {
    type: DataTypes.STRING(80),
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    required: true,
  },
  name: {
    type: DataTypes.STRING(35),
    allowNull: false,
    required: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  contact_number: {
    type: DataTypes.STRING(15),
  },
  city: {
    type: DataTypes.STRING(25),
  },
  state: {
    type: DataTypes.STRING(25),
  },
  pincode: {
    type: DataTypes.INTEGER,
  },
  gender: {
    type: DataTypes.STRING(6),
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
  jobType: {
    type: DataTypes.INTEGER(2),
    comment: '0=office,1=field',
  },
  location: {
    type: DataTypes.STRING(65),
  },
  points: {
    type: DataTypes.STRING(10),
    defaultValue: '0',
  },
  deviceToken: {
    type: DataTypes.STRING,
  },
  isCurrentMonthStarPerformer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isContactNoVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
})

module.exports = { Team }
