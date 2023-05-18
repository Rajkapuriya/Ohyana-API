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
const { TEAM } = require('../constants')
const teamRouter = express.Router()

// ------------------------------- Team Members -------------------------------

teamRouter.post(
  '/member',
  upload.single('profile_image'),
  joiValidationMiddleware(teamSchema.teamForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_STAFF]),
  teamController.addTeamMember,
)

teamRouter.get(
  '/member',
  joiValidationMiddleware(teamSchema.teamMemberList),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_STAFF]),
  teamController.getAllTeamMembers,
)

teamRouter.get(
  '/member/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_STAFF]),
  teamController.getSingleMember,
)

teamRouter.put(
  '/member',
  upload.single('profile_image'),
  joiValidationMiddleware(teamSchema.updateTeamMemberDetails),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_STAFF]),
  teamController.updateTeamMemberDetails,
)

// ------------------------------- Profile -------------------------------

teamRouter.get('/profile', authTokenMiddleware, teamController.getProfile)

teamRouter.put(
  '/profile',
  upload.single('profile_image'),
  joiValidationMiddleware(teamSchema.updateProfile),
  authTokenMiddleware,
  teamController.updateProfile,
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
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_STAFF]),
  teamController.getTeamLeaderBoardDetails,
)

// ------------------------------- Location -------------------------------

teamRouter.post(
  '/member/location',
  joiValidationMiddleware(teamSchema.savelocation),
  authTokenMiddleware,
  teamController.saveLocation,
)

teamRouter.get(
  '/location/member',
  authTokenMiddleware,
  teamController.getTeamMemberLocation,
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
  permissionHandleMiddleware([TEAM.PERMISSIONS.UPDATE_EXPENSE_APPROVAL_STATUS]),
  teamController.approveExpense,
)

teamRouter.patch(
  '/team/approve/expense/payment',
  joiValidationMiddleware(teamSchema.approveExpensePayment),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.UPDATE_EXPENSE_PAYMENT_STATUS]),
  teamController.approveExpensePayment,
)

module.exports = teamRouter
