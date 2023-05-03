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
const clientRouter = express.Router()

// ------------------------------- Client -------------------------------

clientRouter.post(
  '/client',
  joiValidationMiddleware(clientSchema.clientForm),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.editClient && req.user.role.permission.clientMenu',
  ),
  clientController.addClient,
)

clientRouter.get(
  '/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.getClientProfile,
)

clientRouter.get(
  '/clients',
  joiValidationMiddleware(clientSchema.clientList),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.getAllClients,
)

clientRouter.put(
  '/client/:id',
  joiValidationMiddleware(clientSchema.clientForm),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.clientMenu && req.user.role.permission.editClient',
  ),
  clientController.updateClient,
)

clientRouter.delete(
  '/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.clientMenu && req.user.role.permission.deleteClient',
  ),
  clientController.deleteClient,
)

clientRouter.put(
  '/take/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.takeClient,
)

// ------------------------------- Client Business Card -------------------------------

clientRouter.get(
  '/businesscard/:id',
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.clientMenu && req.user.clientStageAccess !== null',
  ),
  clientController.getBusinessCardDetail,
)

clientRouter.post(
  '/businesscard',
  upload.single('customer_image'),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.clientMenu && req.user.clientStageAccess !== null',
  ),
  clientController.addBusinessCard,
)

clientRouter.delete(
  '/businesscard/:id',
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.clientMenu && req.user.clientStageAccess !== null',
  ),
  clientController.deleteBusinessCard,
)

// ------------------------------- Update Client Stage -------------------------------

clientRouter.put(
  '/stage/client/:id',
  joiValidationMiddleware(clientSchema.stage),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.clientMenu && req.user.clientStageAccess !== null',
  ),
  clientController.updateClientStage,
)

// ------------------------------- Client Status Routes ---------------------------------------

clientRouter.post(
  '/status/client',
  upload.single('status_audio_file'),
  joiValidationMiddleware(clientSchema.addClientStatus),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.addClientStatus,
)

clientRouter.get(
  '/status/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.getAllClientStatus,
)

clientRouter.put(
  '/status/client',
  joiValidationMiddleware(clientSchema.updatedClientStatus),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.updateStatus,
)

clientRouter.patch(
  '/client/status/closed',
  joiValidationMiddleware(clientSchema.closeClientInquiry),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.closeClientInquery,
)

// ------------------------------- Client Reminder Routes -------------------------------

clientRouter.post(
  '/reminder/client',
  joiValidationMiddleware(clientSchema.addClientReminder),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.addClientReminder,
)

clientRouter.get(
  '/reminder/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.getAllClientReminder,
)

clientRouter.put(
  '/reminder/client',
  joiValidationMiddleware(clientSchema.updateClientReminder),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.updateReminder,
)

clientRouter.delete(
  '/reminder/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.deleteClientReminder,
)

// ------------------------------- Client Appointment Routes -------------------------------

clientRouter.post(
  '/appointment/client',
  joiValidationMiddleware(clientSchema.addClientAppointment),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.addClientAppointment,
)

clientRouter.get(
  '/appointment/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.getAllClientAppointment,
)

clientRouter.put(
  '/appointment/client',
  joiValidationMiddleware(clientSchema.updatedClientAppointment),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.updateAppointment,
)

clientRouter.delete(
  '/appointment/client/:id',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  clientController.deleteClientAppointment,
)

// ------------------------------- Get Files From Server -------------------------------

clientRouter.get('/file/:path', clientController.getFileForResponse)

module.exports = clientRouter
