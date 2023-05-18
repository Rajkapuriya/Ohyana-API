const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Permission = sequelize.define(
  'permission',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  { paranoid: true },
)

module.exports = { Permission }
