const Joi = require('joi')

exports.roleSchema = {
  roleForm: Joi.object({
    body: Joi.object({
      name: Joi.string().min(2).required(),
      description: Joi.string().min(5).allow(null, ''),
      clockIn: Joi.string().required(),
      parentId: Joi.number().required(),
    }).required(),
  }).unknown(),

  updateRoleForm: Joi.object({
    body: Joi.object({
      name: Joi.string().min(2),
      description: Joi.string().min(5).allow(null, ''),
      parentId: Joi.number(),
    }).required(),
  }).unknown(),

  roleList: Joi.object({
    query: Joi.object({
      selection: Joi.boolean(),
    }).required(),
  }).unknown(),

  rolePermissions: Joi.object({
    body: Joi.object({
      roleId: Joi.number().required(),
      clientMenu: Joi.boolean().required(),
      editClient: Joi.boolean().required(),
      deleteClient: Joi.boolean().required(),
      viewClient: Joi.boolean().required(),
      staffMenu: Joi.boolean().required(),
      viewStaff: Joi.boolean().required(),
      editStaff: Joi.boolean().required(),
      deleteStaff: Joi.boolean().required(),
      settingMenu: Joi.boolean().required(),
      viewRole: Joi.boolean().required(),
      editRole: Joi.boolean().required(),
      deleteRole: Joi.boolean().required(),
      viewProduct: Joi.boolean().required(),
      editProduct: Joi.boolean().required(),
      deleteProduct: Joi.boolean().required(),
      accessClient: Joi.boolean().required(),
      accessStaff: Joi.boolean().required(),
      accessSetting: Joi.boolean().required(),
      clientStageAccess: Joi.number().required(),
    }).required(),
  }).unknown(),

  getSingleRoles: Joi.object({
    query: Joi.object({
      roleId: Joi.number().required(),
    }).required(),
  }).unknown(),

  updateClockInClockOut: Joi.object({
    body: Joi.object({
      clockIn: Joi.string(),
      clockOut: Joi.string(),
      roleId: Joi.number().required(),
    }).required(),
  }).unknown(),

  updateExpensePermissions: Joi.object({
    body: Joi.object({
      roleId: Joi.number().required(),
      expensePolicies: Joi.array().required(),
    }).required(),
  }).unknown(),
}
