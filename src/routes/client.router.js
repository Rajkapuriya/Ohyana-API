const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { upload } = require('../middleware/multer.middleware')
const { clientSchema } = require('../validators/client.validator')
const clientController = require('../controllers/client.controller')

const express = require('express')
const { TEAM } = require('../constants')
const { Team } = require('../models')
const clientRouter = express.Router()

// ------------------------------- Client -------------------------------

clientRouter.post(
  '/client',
  upload.single('customer_image'),
  joiValidationMiddleware(clientSchema.clientForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_CLIENT]),
  clientController.addClient,
)

clientRouter.get(
  '/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.getClientProfile,
)

clientRouter.get(
  '/clients',
  joiValidationMiddleware(clientSchema.clientList),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.getAllClients,
)

clientRouter.put(
  '/client/:id',
  upload.single('customer_image'),
  joiValidationMiddleware(clientSchema.clientForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_CLIENT]),
  clientController.updateClient,
)

clientRouter.delete(
  '/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.DELETE_CLIENT]),
  clientController.deleteClient,
)

clientRouter.put(
  '/take/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.takeClient,
)

// ------------------------------- Client Business Card -------------------------------

clientRouter.get(
  '/businesscard/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.getBusinessCardDetail,
)

clientRouter.post(
  '/businesscard',
  upload.single('customer_image'),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.ADD_BUSINESS_CARD]),
  clientController.addBusinessCard,
)

clientRouter.delete(
  '/businesscard/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.DELETE_CLIENT]),
  clientController.deleteBusinessCard,
)

// ------------------------------- Update Client Stage -------------------------------

clientRouter.put(
  '/stage/client/:id',
  joiValidationMiddleware(clientSchema.stage),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.updateClientStage,
)

// ------------------------------- Client Status Routes ---------------------------------------

clientRouter.post(
  '/status/client',
  upload.single('status_audio_file'),
  joiValidationMiddleware(clientSchema.addClientStatus),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.addClientStatus,
)

clientRouter.get(
  '/status/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.getAllClientStatus,
)

clientRouter.put(
  '/status/client',
  joiValidationMiddleware(clientSchema.updatedClientStatus),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.updateStatus,
)

clientRouter.patch(
  '/client/status/closed',
  joiValidationMiddleware(clientSchema.closeClientInquiry),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.closeClientInquery,
)

// ------------------------------- Client Reminder Routes -------------------------------

clientRouter.post(
  '/reminder/client',
  joiValidationMiddleware(clientSchema.addClientReminder),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.addClientReminder,
)

clientRouter.get(
  '/reminder/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.getAllClientReminder,
)

clientRouter.put(
  '/reminder/client',
  joiValidationMiddleware(clientSchema.updateClientReminder),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.updateReminder,
)

clientRouter.delete(
  '/reminder/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.deleteClientReminder,
)

// ------------------------------- Client Appointment Routes -------------------------------

clientRouter.post(
  '/appointment/client',
  joiValidationMiddleware(clientSchema.addClientAppointment),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.addClientAppointment,
)

clientRouter.get(
  '/appointment/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.getAllClientAppointment,
)

clientRouter.put(
  '/appointment/client',
  joiValidationMiddleware(clientSchema.updatedClientAppointment),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.updateAppointment,
)

clientRouter.delete(
  '/appointment/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_CLIENT]),
  clientController.deleteClientAppointment,
)

// ------------------------------- Get Files From Server -------------------------------

clientRouter.get('/file/:path', clientController.getFileForResponse)

module.exports = clientRouter
