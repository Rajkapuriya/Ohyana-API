const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATE,
  },
  total_items: {
    type: DataTypes.INTEGER,
  },
  order_total: {
    type: DataTypes.INTEGER,
  },
  orderTrackingStatus: {
    type: DataTypes.STRING(15),
    allowNull: false,
    required: true,
    validate: {
      isIn: [['PENDING', 'DISPATCH', 'SHIPPING', 'DELIEVERED']],
    },
  },
  paymentStatus: {
    type: DataTypes.STRING(10),
    allowNull: false,
    required: true,
    validate: {
      isIn: [['PENDING', 'CONFIRMED']],
    },
  },
  paymentMethod: {
    type: DataTypes.STRING(15),
    // allowNull: false,
    // required: true,
    validate: {
      isIn: [['UPI', 'CASH', 'CARD', 'CHECK', 'NETBANKING', 'OTHER']],
    },
  },
})

Order.updateOrder = async function (body, id) {
  await this.update(body, { where: { id } })
  return this.findByPk(id)
}

module.exports = { Order }
