const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Task = sequelize.define('task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  due_date: {
    type: DataTypes.DATEONLY,
  },
  createdBy: {
    type: DataTypes.STRING,
  },
})

Task.updateTask = async function (body, id) {
  await this.update(body, { where: { id } })
  return this.findByPk(id)
}

module.exports = { Task }
