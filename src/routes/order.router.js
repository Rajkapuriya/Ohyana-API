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
const { TEAM } = require('../constants')
const orderRouter = express.Router()

orderRouter.post(
  '/addtocart',
  joiValidationMiddleware(orderSchema.addtoCart),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.PLACE_ORDER]),
  orderController.addToCart,
)

orderRouter.get(
  '/cart/items/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_ORDERS]),
  orderController.getAllCartItem,
)

orderRouter.delete(
  '/cart/items/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.PLACE_ORDER]),
  orderController.deleteCartItem,
)

orderRouter.post(
  '/product-list',
  joiValidationMiddleware(orderSchema.productListById),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.PLACE_ORDER]),
  orderController.getProductListFromIds,
)

orderRouter.patch(
  '/cart/product/quantity',
  joiValidationMiddleware(orderSchema.updateCartProductQuatity),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.PLACE_ORDER]),
  orderController.updateCartProductQuatity,
)

orderRouter.post(
  '/placeorder',
  joiValidationMiddleware(orderSchema.placeOrder),
  authTokenMiddleware,
  permissionHandleMiddleware([
    TEAM.PERMISSIONS.PLACE_ORDER,
    TEAM.PERMISSIONS.VIEW_CLIENT,
  ]),
  orderController.placeOrder,
)

orderRouter.patch(
  '/payment/:orderId',
  joiValidationMiddleware(orderSchema.paymentStatus),
  authTokenMiddleware,
  permissionHandleMiddleware([
    TEAM.PERMISSIONS.UPDATE_ORDER_PAYMENT_STATUS,
    TEAM.PERMISSIONS.VIEW_CLIENT,
  ]),
  orderController.updatePaymentStatus,
)

orderRouter.patch(
  '/delivery/:orderId',
  joiValidationMiddleware(orderSchema.orderTrackingStatus),
  authTokenMiddleware,
  permissionHandleMiddleware([
    TEAM.PERMISSIONS.UPDATE_ORDER_DELIVERY_STATUS,
    TEAM.PERMISSIONS.VIEW_CLIENT,
  ]),
  orderController.updateOrderTrackingStatus,
)

orderRouter.get(
  '/orders',
  joiValidationMiddleware(orderSchema.orderList),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_ORDERS]),
  orderController.getAllOrderList,
)

orderRouter.get(
  '/orderitems/:orderId',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_ORDERS]),
  orderController.getAllItemsPerOrder,
)

module.exports = orderRouter
