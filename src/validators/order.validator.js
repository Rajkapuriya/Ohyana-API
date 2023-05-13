const Joi = require('joi')

exports.orderSchema = {
  addtoCart: Joi.object({
    body: Joi.object({
      productId: Joi.number(),
      quantity: Joi.number(),
      clientId: Joi.number(),
    }).required(),
  }).unknown(),

  paymentStatus: Joi.object({
    body: Joi.object({
      status: Joi.string().valid('PENDING', 'CONFIRMED').required(),
      method: Joi.string()
        .valid('UPI', 'CASH', 'CARD', 'CHECK', 'NETBANKING', 'OTHER')
        .required(),
    }).required(),
  }).unknown(),

  orderTrackingStatus: Joi.object({
    body: Joi.object({
      status: Joi.string().valid('DELIVERED', 'DISPATCH').required(),
    }).required(),
  }).unknown(),

  productListById: Joi.object({
    body: Joi.object({
      productIds: Joi.array().required(),
    }).required(),
  }).unknown(),

  orderList: Joi.object({
    query: Joi.object({
      page: Joi.number(),
      size: Joi.number(),
      all: Joi.boolean(),
      delivery: Joi.string().valid('PENDING', 'DISPATCH'),
      payment: Joi.string().valid('PENDING', 'CONFIRMED'),
      orderDate: Joi.string(),
      searchQuery: Joi.string(),
      clientId: Joi.number(),
    }).required(),
  }).unknown(),

  updateCartProductQuatity: Joi.object({
    body: Joi.object({
      productId: Joi.number().required(),
      quantity: Joi.number().required(),
      cartId: Joi.number().required(),
    }).required(),
  }).unknown(),

  placeOrder: Joi.object({
    body: Joi.object({
      orders: Joi.array().min(1).required(),
      clientId: Joi.number().required(),
    }).required(),
  }).unknown(),
}
