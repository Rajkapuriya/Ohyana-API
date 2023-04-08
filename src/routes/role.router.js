const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { roleSchema } = require('../validators/role.validator')
const roleController = require('../controllers/role.controller')

const express = require('express')
const roleRouter = express.Router()

// ------------------------------- Role -------------------------------

roleRouter.post(
  '/role',
  joiValidationMiddleware(roleSchema.roleForm),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editRole',
  ),
  roleController.createRole,
)

roleRouter.get(
  '/role',
  joiValidationMiddleware(roleSchema.roleList),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.viewRole',
  ),
  roleController.getAllRoles,
)

roleRouter.put(
  '/clockin-out',
  joiValidationMiddleware(roleSchema.updateClockInClockOut),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.viewRole',
  ),
  roleController.updateClockInOutTime,
)

roleRouter.get(
  '/role/detail',
  joiValidationMiddleware(roleSchema.getSingleRoles),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.viewRole',
  ),
  roleController.getSingleRoles,
)

roleRouter.put(
  '/role/:id',
  joiValidationMiddleware(roleSchema.roleForm),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editRole',
  ),
  roleController.updateRole,
)

roleRouter.delete(
  '/role/:id',
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editRole',
  ),
  roleController.deleteRole,
)

roleRouter.delete(
  '/role/:id',
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editRole',
  ),
  roleController.deleteRole,
)

// ------------------------------- Permission -------------------------------

roleRouter.get(
  '/permissions/:id',
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editRole',
  ),
  roleController.getPermissions,
)

roleRouter.put(
  '/permissions',
  joiValidationMiddleware(roleSchema.rolePermissions),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editRole',
  ),
  roleController.updateRolePermissions,
)

roleRouter.put(
  '/expense/permissions',
  joiValidationMiddleware(roleSchema.updateExpensePermissions),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editRole',
  ),
  roleController.updateExpensePermissions,
)

module.exports = roleRouter
