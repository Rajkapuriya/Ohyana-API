const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Order = sequelize.define(
  'order',
  {
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
    city: {
      type: DataTypes.STRING(20),
    },
    city_id: {
      type: DataTypes.INTEGER,
    },
    state: {
      type: DataTypes.STRING(20),
    },
    state_id: {
      type: DataTypes.INTEGER,
    },
    state_iso2: {
      type: DataTypes.STRING(5),
    },
    country_id: {
      type: DataTypes.INTEGER,
    },
    country_iso2: {
      type: DataTypes.STRING(5),
    },
    country: {
      type: DataTypes.STRING(20),
    },
    orderTrackingStatus: {
      type: DataTypes.STRING(15),
      allowNull: false,
      required: true,
      comment: 'PENDING , DISPATCH , SHIPPING , DELIVERED',
      validate: {
        isIn: [['PENDING', 'DISPATCH', 'SHIPPING', 'DELIVERED']],
      },
    },
    dispatch_date: {
      type: DataTypes.DATE,
    },
    delivered_date: {
      type: DataTypes.DATE,
    },
    paymentStatus: {
      type: DataTypes.STRING(10),
      allowNull: false,
      required: true,
      comment: 'PENDING , CONFIRMED',
      validate: {
        isIn: [['PENDING', 'CONFIRMED']],
      },
    },
    paymentMethod: {
      type: DataTypes.STRING(15),
      // allowNull: false,
      // required: true,
      comment: 'UPI , CASH , CARD , CHECK , NETBANKING , OTHER',
      validate: {
        isIn: [['UPI', 'CASH', 'CARD', 'CHECK', 'NETBANKING', 'OTHER']],
      },
    },
  },
  { paranoid: true },
)

Order.updateOrder = async function (body, id) {
  await this.update(body, { where: { id } })
  return this.findByPk(id)
}

module.exports = { Order }
