const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Checklist = sequelize.define(
  'checklist',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { paranoid: true },
)

module.exports = { Checklist }
