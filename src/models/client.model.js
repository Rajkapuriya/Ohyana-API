const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Client = sequelize.define('client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  arrivalDate: {
    type: DataTypes.DATE,
  },
  arrivalTime: {
    type: DataTypes.TIME,
  },
  business: {
    type: DataTypes.STRING,
  },
  contact_number: {
    type: DataTypes.STRING,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  },
  reference: {
    type: DataTypes.STRING,
    validate: {
      // isIn: [['INDIAMART', 'WEBSITE', 'OFFICE', 'OTHER']],
    },
  },
  reference_name: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
  },
  max_invesment_amount: {
    type: DataTypes.STRING,
  },
})

module.exports = { Client }
