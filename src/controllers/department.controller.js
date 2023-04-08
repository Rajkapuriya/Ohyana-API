const { Department, Team, Role } = require('../models')
const {
  successResponse,
  forbiddenRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants/message.contant')

exports.createDepartment = async (req, res) => {
  const { name } = req.body

  const [, created] = await Department.findOrCreate({
    where: { name, companyId: req.user.companyId },
    defaults: { name, companyId: req.user.companyId },
  })

  if (!created)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllDepartment = async (req, res) => {
  const department = await Department.findAll({
    attributes: ['id', 'name'],
    where: { companyId: req.user.companyId },
  })

  if (department.length === 0) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    department,
  )
}

exports.updateDepartment = async (req, res) => {
  const { name } = req.body

  const existetDepartment = await Department.findOne({
    where: { name, companyId: req.user.companyId },
  })
  if (existetDepartment)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  await Department.update({ name }, { where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.deleteDepartment = async (req, res) => {
  const [teamMemberRelatedToDepartment, roleRelatedDepartment] =
    await Promise.all([
      Team.findOne({ where: { departmentId: req.params.id } }),
      Role.findOne({ where: { departmentId: req.params.id } }),
    ])

  if (!teamMemberRelatedToDepartment && !roleRelatedDepartment) {
    await Department.destroy({ where: { id: req.params.id } })
    return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
  } else {
    return forbiddenRequestError(
      res,
      'This Department is associated to team member or job role',
    )
  }
}
