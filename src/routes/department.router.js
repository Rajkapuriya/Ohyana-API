const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { departmentSchema } = require('../validators/department.validator')
const departmentController = require('../controllers/department.controller')

const express = require('express')
const departmentRouter = express.Router()

// ------------------------------- Department -------------------------------

departmentRouter.post(
  '/department',
  joiValidationMiddleware(departmentSchema.departmentForm),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editDepartment',
  ),
  departmentController.createDepartment,
)

departmentRouter.get(
  '/department',
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.viewDepartment',
  ),
  departmentController.getAllDepartment,
)

departmentRouter.put(
  '/department/:id',
  joiValidationMiddleware(departmentSchema.departmentForm),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editDepartment',
  ),
  departmentController.updateDepartment,
)

departmentRouter.delete(
  '/department/:id',
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.deleteDepartment',
  ),
  departmentController.deleteDepartment,
)

module.exports = departmentRouter
