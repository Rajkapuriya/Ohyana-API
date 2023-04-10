const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Client = sequelize.define('client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(50),
  },
  name: {
    type: DataTypes.STRING(50),
  },
  arrivalDate: {
    type: DataTypes.DATEONLY,
  },
  arrivalTime: {
    type: DataTypes.TIME,
  },
  business: {
    type: DataTypes.STRING(100),
  },
  contact_number: {
    type: DataTypes.STRING(15),
  },
  imageUrl: {
    type: DataTypes.STRING(80),
  },
  address: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING(20),
  },
  state: {
    type: DataTypes.STRING(20),
  },
  reference: {
    type: DataTypes.STRING(15),
    validate: {
      isIn: [['DIGITAL', 'OFFICE', 'OTHER']],
    },
  },
  reference_name: {
    type: DataTypes.STRING(15),
  },
  stage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment:
      '0=intiate,1=negative,2=no response,3=irrelevant,4=inter-mediate,5=confirm',
  },
  indiaMartProductName: {
    type: DataTypes.STRING,
  },
  indiaMartMessage: {
    type: DataTypes.STRING,
  },
  timer_status: {
    type: DataTypes.BOOLEAN,
  },
  isInternational: {
    type: DataTypes.BOOLEAN,
  },
  min_invesment_amount: {
    type: DataTypes.INTEGER,
  },
  max_invesment_amount: {
    type: DataTypes.INTEGER,
  },
})

module.exports = { Client }
