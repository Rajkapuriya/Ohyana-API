const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { Role } = require('./role.model')

const Permission = sequelize.define('permission', {
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id',
    },
  },
  clientMenu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  editClient: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deleteClient: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  staffMenu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  editStaff: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deleteStaff: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  settingMenu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewRole: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  editRole: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deleteRole: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewProduct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  editProduct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deleteProduct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  accessClient: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  accessStaff: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  accessSetting: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  clientStageAccess: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
})

module.exports = { Permission }
