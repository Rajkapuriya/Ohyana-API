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
const { TEAM } = require('../constants')
const roleRouter = express.Router()

// ------------------------------- Role -------------------------------

roleRouter.post(
  '/role',
  joiValidationMiddleware(roleSchema.roleForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_ROLE]),
  roleController.createRole,
)

roleRouter.get(
  '/role',
  joiValidationMiddleware(roleSchema.roleList),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_ROLE]),
  roleController.getAllRoles,
)

roleRouter.put(
  '/clockin-out',
  joiValidationMiddleware(roleSchema.updateClockInClockOut),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_ROLE]),
  roleController.updateClockInOutTime,
)

roleRouter.get(
  '/role/detail',
  joiValidationMiddleware(roleSchema.getSingleRoles),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_ROLE]), // Edit Role Permission Because if user has permission of edit role that he/she can access this route
  roleController.getSingleRoles,
)

roleRouter.put(
  '/role/:id',
  joiValidationMiddleware(roleSchema.updateRoleForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_ROLE]),
  roleController.updateRole,
)

roleRouter.delete(
  '/role/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.DELETE_ROLE]),
  roleController.deleteRole,
)

// ------------------------------- Permission -------------------------------

roleRouter.get(
  '/permissions/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_ROLE]),
  roleController.getPermissions,
)

roleRouter.put(
  '/permissions',
  joiValidationMiddleware(roleSchema.rolePermissions),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_ROLE]),
  roleController.updateRolePermissions,
)

roleRouter.put(
  '/expense/permissions',
  joiValidationMiddleware(roleSchema.updateExpensePermissions),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_ROLE]),
  roleController.updateExpensePermissions,
)

module.exports = roleRouter
