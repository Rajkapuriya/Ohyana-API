const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { Role } = require('./role.model')

const Role_Permissions = sequelize.define(
  'role_permissions',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: 'id',
      },
    },
    permissions: {
      type: DataTypes.STRING,
    },
  },
  { paranoid: true },
)

module.exports = { Role_Permissions }
