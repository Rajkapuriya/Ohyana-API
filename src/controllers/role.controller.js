const {
  Role,
  Team,
  Permission,
  Role_Expense_Permissions,
  Expense,
  Role_Permissions,
} = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../database/mysql')
const {
  successResponse,
  forbiddenRequestError,
  notFoundError,
  badRequestError,
  unProcessableEntityRequestError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants')

exports.createRole = async (req, res) => {
  const { name, description, clockIn, parentId } = req.body

  const existedRole = await Role.findOne({
    where: { name, companyId: req.user.companyId },
  })

  if (existedRole)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  const role = await Role.create({
    name,
    description,
    clockIn,
    companyId: req.user.companyId,
    parentId,
  })

  await Role_Permissions.create({ roleId: role.id })

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllRoles = async (req, res) => {
  const { selection } = req.query

  const attributes = ['id', 'name', 'description', 'parentId']
  const filterCondition = { parentId: { [Op.ne]: null } }

  if (selection === 'true') {
    attributes.pop()
    delete filterCondition.parentId
  }

  const roles = await Role.findAll({
    attributes,
    where: { companyId: req.user.companyId, ...filterCondition },
  })

  for (const role of roles) {
    if (role.parentId) {
      const parentRole = await Role.findOne({
        attributes: ['name'],
        where: { id: role.parentId },
      })
      role.setDataValue('senior', parentRole)

      delete role.dataValues.parentId
    }
  }
  if (roles.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, roles)
}

exports.getSingleRoles = async (req, res) => {
  const { roleId } = req.query

  const role = await Role.findOne({
    where: { id: roleId },
  })

  if (!role) return notFoundError(res)

  if (role.parentId) {
    const parentRole = await Role.findOne({
      attributes: ['id', 'name', 'description'],
      where: { id: role.parentId },
    })
    role.setDataValue('senior', parentRole)

    delete role.dataValues.parentId
  }

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, role)
}

exports.updateRole = async (req, res) => {
  const { name, description, parentId } = req.body

  if (name.toLowerCase() === 'CEO'.toLowerCase())
    return forbiddenRequestError(res, 'Name is Prohibited')

  if (parentId == req.params.id)
    return badRequestError(res, 'Senior Role is Invalid')

  const existedRole = await Role.findOne({
    where: {
      name,
      id: { [Op.ne]: req.params.id },
      companyId: req.user.companyId,
    },
  })
  if (existedRole)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)
  await Role.update(
    { name, description, parentId },
    { where: { id: req.params.id } },
  )
  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.updateClockInOutTime = async (req, res) => {
  const { clockIn, clockOut, roleId } = req.body

  if (!clockIn && !clockOut)
    return unProcessableEntityRequestError(res, 'Please Provide Time')

  await Role.update({ ...req.body }, { where: { id: roleId } })

  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.deleteRole = async (req, res) => {
  await Role.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
}

exports.getPermissions = async (req, res) => {
  const { id } = req.params

  const permissionString = await Role_Permissions.findOne({
    attributes: ['permissions'],
    where: { roleId: id },
  })

  let permission = []

  if (permissionString && permissionString.permissions) {
    permission = await Permission.findAll({
      attributes: ['name'],
      where: {
        id: permissionString.permissions.split(','),
      },
    })
  }

  const [expensePermissions, expensePolicies] = await Promise.all([
    Role_Expense_Permissions.findAll({
      attributes: ['expenseId', 'amount'],
      where: { roleId: id, status: 'active' },
    }),
    Expense.findAll({
      attributes: ['id', 'name'],
    }),
  ])

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
    permissions: permission.map(p => p.name),
    expensePermissions,
    expensePolicies,
  })
}

exports.updateRolePermissions = async (req, res) => {
  const { roleId, permissions } = req.body

  const adminRoleDetail = await Role.findOne({
    attributes: ['parentId'],
    where: { id: roleId },
  })

  if (!adminRoleDetail.parentId) return forbiddenRequestError(res)

  const permissionsIds = await Permission.findAll({
    attributes: ['id'],
    where: { name: permissions },
  })

  await Role_Permissions.update(
    { permissions: permissionsIds.map(p => p.id).toString() },
    { where: { roleId } },
  )

  return successResponse(res, 'Permission Updated Successfully')
}

exports.updateExpensePermissions = async (req, res) => {
  const { roleId, expensePolicies } = req.body

  if (expensePolicies.length > 0) {
    const policies = expensePolicies.map(e => {
      return { expenseId: e.id, roleId, amount: e.amount, status: 'active' }
    })

    await Role_Expense_Permissions.update(
      { status: 'inactive' },
      { where: { roleId } },
    )

    await Role_Expense_Permissions.bulkCreate(policies, {
      updateOnDuplicate: ['amount', 'status'],
    })
  }

  return successResponse(res, 'Expense Permission Updated Successfully')
}

exports.updateClientStageAccessPermission = async (req, res) => {
  const { roleId, stage } = req.body

  await Role.update({ clientStageAccess: stage }, { where: { id: roleId } })
  return successResponse(res, 'Permission Updated Successfully')
}
