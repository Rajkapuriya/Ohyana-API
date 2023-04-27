const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Cart = sequelize.define(
  'cart',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
  },
  { paranoid: true },
)

module.exports = { Cart }
