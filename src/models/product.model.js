const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Product = sequelize.define('product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.INTEGER,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  weight: {
    type: DataTypes.STRING,
  },
  materialType: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  skuId: {
    type: DataTypes.STRING,
  },
})

Product.updateProduct = async function (body, id) {
  await this.update(body, { where: { id } })
  return this.findByPk(id)
}

module.exports = { Product }
