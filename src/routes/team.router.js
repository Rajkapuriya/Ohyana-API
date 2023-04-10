const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { upload } = require('../middleware/multer.middleware')
const { teamSchema } = require('../validators/team.validator')
const teamController = require('../controllers/team.controller')

const express = require('express')
const teamRouter = express.Router()

// ------------------------------- Team Members -------------------------------

teamRouter.post(
  '/member',
  upload.single('image'),
  joiValidationMiddleware(teamSchema.teamForm),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.staffMenu && req.user.role.permission.editStaff',
  ),
  teamController.addTeamMember,
)

teamRouter.get(
  '/member',
  joiValidationMiddleware(teamSchema.teamMemberList),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.staffMenu'),
  teamController.getAllTeamMembers,
)

teamRouter.get(
  '/member/:id',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.staffMenu'),
  teamController.getSingleMember,
)

teamRouter.put(
  '/member',
  upload.single('image'),
  joiValidationMiddleware(teamSchema.updateTeamMemberDetails),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.staffMenu && req.user.role.permission.editStaff',
  ),
  teamController.updateTeamMemberDetails,
)

// ------------------------------- Profile -------------------------------

teamRouter.get('/profile', authTokenMiddleware, teamController.getProfile)

teamRouter.put(
  '/profile',
  upload.single('image'),
  joiValidationMiddleware(teamSchema.updateProfile),
  authTokenMiddleware,
  teamController.updateAdminProfile,
)

teamRouter.put(
  '/team/token',
  joiValidationMiddleware(teamSchema.updateToken),
  authTokenMiddleware,
  teamController.verfifyAndUpdateFirebaseToken,
)

teamRouter.get(
  '/team/leaderboard/:id',
  authTokenMiddleware,
  teamController.getTeamLeaderBoardDetails,
)

// ------------------------------- Location -------------------------------

teamRouter.post(
  '/member/location',
  joiValidationMiddleware(teamSchema.savelocation),
  authTokenMiddleware,
  teamController.saveLocation,
)

// ------------------------------- Expenses -------------------------------

teamRouter.post(
  '/team/expense',
  upload.single('expense_file'),
  joiValidationMiddleware(teamSchema.addExpense),
  authTokenMiddleware,
  teamController.addExpense,
)

teamRouter.get(
  '/team/expense',
  joiValidationMiddleware(teamSchema.getExpense),
  authTokenMiddleware,
  teamController.getExpense,
)

teamRouter.patch(
  '/team/approve/expense',
  joiValidationMiddleware(teamSchema.approveExpense),
  authTokenMiddleware,
  teamController.approveExpense,
)

teamRouter.patch(
  '/team/approve/expense/payment',
  joiValidationMiddleware(teamSchema.approveExpensePayment),
  authTokenMiddleware,
  teamController.approveExpensePayment,
)

module.exports = teamRouter
