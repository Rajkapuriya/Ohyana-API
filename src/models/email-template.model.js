const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const EmailTemplate = sequelize.define(
  'email_template',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject: {
      type: DataTypes.STRING(100),
    },
    content: {
      type: DataTypes.TEXT('long'),
    },
  },
  { paranoid: true },
)

module.exports = { EmailTemplate }
