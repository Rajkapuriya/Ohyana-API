const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Order_Item = sequelize.define('order_item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
})

module.exports = { Order_Item }
