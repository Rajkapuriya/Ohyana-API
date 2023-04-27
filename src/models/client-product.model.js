const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { Client } = require('./client.model')
const { Product } = require('./product.model')

const Client_Product = sequelize.define(
  'client_product',
  {
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client,
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: 'id',
      },
    },
  },
  { paranoid: true },
)

module.exports = { Client_Product }
