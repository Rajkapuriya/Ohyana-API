const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { orderSchema } = require('../validators/order.validator')
const orderController = require('../controllers/order.controller')

const express = require('express')
const orderRouter = express.Router()

orderRouter.post(
  '/addtocart',
  joiValidationMiddleware(orderSchema.addtoCart),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  orderController.addToCart,
)

orderRouter.get(
  '/cart/items',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  orderController.getAllCartItem,
)

orderRouter.post(
  '/product-list',
  joiValidationMiddleware(orderSchema.productListById),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  orderController.getProductListFromIds,
)

orderRouter.patch(
  '/cart/product/quantity',
  joiValidationMiddleware(orderSchema.updateCartProductQuatity),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  orderController.updateCartProductQuatity,
)

orderRouter.post(
  '/placeorder',
  joiValidationMiddleware(orderSchema.placeOrder),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  orderController.placeOrder,
)

orderRouter.patch(
  '/payment/:orderId',
  joiValidationMiddleware(orderSchema.paymentStatus),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  orderController.updatePaymentStatus,
)

orderRouter.get(
  '/orders',
  joiValidationMiddleware(orderSchema.orderList),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  orderController.getAllOrderSummary,
)

orderRouter.get(
  '/orderitems/:orderId',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.clientMenu'),
  orderController.getAllItemsPerOrder,
)

module.exports = orderRouter
