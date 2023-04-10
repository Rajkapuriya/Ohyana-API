const {
  Role,
  Department,
  Team,
  Permission,
  Role_Expense_Permissions,
  Expense,
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
const { MESSAGE } = require('../constants/message.contant')

exports.createRole = async (req, res) => {
  const { name, description, clockIn, parentId } = req.body

  if (name.toLowerCase() === 'Admin'.toLowerCase())
    return forbiddenRequestError(res, 'Name is Prohibited')

  const existedRole = await Role.findOne({
    where: { name, companyId: req.user.companyId },
  })

  if (existedRole)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  await sequelize.transaction(async t => {
    const role = await Role.create(
      {
        name,
        description,
        clockIn,
        companyId: req.user.companyId,
        parentId,
      },
      { transaction: t },
    )

    await Permission.create({ roleId: role.id }, { transaction: t })
  })

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllRoles = async (req, res) => {
  const { departmentId } = req.query

  if (departmentId && departmentId !== 'null') {
    const [department, role] = await Promise.all([
      Department.findOne({
        attributes: ['id', 'name'],
        where: { id: departmentId },
      }),
      Role.findAll({
        attributes: ['id', 'name', 'description'],
        where: { departmentId: departmentId },
      }),
    ])

    if (role.length === 0) return notFoundError(res)

    return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
      department,
      roles: role,
    })
  } else {
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'description'],
      where: { parentId: { [Op.ne]: null }, companyId: req.user.companyId },
    })

    if (roles.length === 0) return notFoundError(res)

    return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, roles)
  }
}

exports.getSingleRoles = async (req, res) => {
  const { roleId } = req.query

  const role = await Role.findOne({
    where: { id: roleId },
    include: [{ model: Permission }],
  })

  if (!role) return notFoundError(res)

  if (role.parentId) {
    const parentRole = await Role.findOne({
      attributes: ['name', 'description'],
      where: { id: role.parentId },
    })
    role.setDataValue('senior', parentRole)

    delete role.dataValues.parentId
  }

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, role)
}

exports.updateRole = async (req, res) => {
  const { name, description, clockIn } = req.body

  if (name.toLowerCase() === 'CEO'.toLowerCase())
    return forbiddenRequestError(res, 'Name is Prohibited')

  const existedRole = await Role.findOne({
    where: {
      name,
      id: { [Op.ne]: req.params.id },
      companyId: req.user.companyId,
    },
  })
  if (existedRole)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)
  console.log()
  await Role.update(
    { name, description, clockIn },
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
  const teamMemberRelatedToDepartment = await Team.findOne({
    where: { roleId: req.params.id },
  })
  if (!teamMemberRelatedToDepartment) {
    await Role.destroy({ where: { id: req.params.id } })
    return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
  } else {
    return forbiddenRequestError(res, 'This Role is associated to team member')
  }
}

exports.getPermissions = async (req, res) => {
  const { id } = req.params

  const [permission, expensePermissions, expensePolicies] = await Promise.all([
    Permission.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt', 'roleId'] },
      where: { roleId: id },
    }),
    Role_Expense_Permissions.findAll({
      attributes: ['expenseId', 'amount', 'id'],
      where: { roleId: id, status: 'active' },
    }),
    Expense.findAll({
      attributes: ['id', 'name'],
    }),
  ])

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
    permissions: permission,
    expensePermissions,
    expensePolicies,
  })
}

exports.updateRolePermissions = async (req, res) => {
  const { roleId } = req.body

  await Permission.update({ roleId, ...req.body }, { where: { roleId } })

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
