const { Cart, Order, Order_Item, Product, Team, Client } = require('../models')
const {
  unProcessableEntityRequestError,
  successResponse,
  forbiddenRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE, ORDERS, POINTS, TARGET, S3 } = require('../constants')
const { YYYY_MM_DD } = require('../utils/moment.util')
const {
  updateTeamMemberPoint,
  updateTeamMemberTarget,
} = require('../utils/common.util')
const { Op } = require('sequelize')
const sequelize = require('../database/mysql')
const { generateS3ConcatString } = require('../utils/s3.util')
const moment = require('moment')
const { S3_CONFIG } = require('../config/s3.config')

exports.addToCart = async (req, res) => {
  const { productId, quantity, clientId } = req.body

  const alreadyInCart = await Cart.findOne({
    where: { productId, teamId: req.user.id },
  })
  if (alreadyInCart) {
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)
  } else {
    const cart = await Cart.create({
      productId,
      teamId: req.user.id,
      clientId,
      quantity: 1,
    })
    return successResponse(
      res,
      MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY,
      cart,
    )
  }
}

exports.updateCartProductQuatity = async (req, res) => {
  const { productId, quantity, cartId } = req.body

  await Cart.update({ quantity }, { where: { productId, id: cartId } })
  return successResponse(res, 'Quantity updated Successfully')
}

exports.getAllCartItem = async (req, res) => {
  const cart = await Cart.findAll({
    attributes: ['id', 'quantity', 'createdAt'],
    where: { teamId: req.user.id, clientId: req.params.id },
    include: [
      {
        model: Product,
        attributes: [
          'id',
          generateS3ConcatString('imageUrl', S3.PRODUCTS),
          'name',
          'price',
        ],
      },
    ],
  })

  if (cart.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, cart)
}

exports.updateCartProductQuatity = async (req, res) => {
  const { productId, quantity, cartId } = req.body

  await Cart.update({ quantity }, { where: { productId, id: cartId } })
  return successResponse(res, 'Quantity updated Successfully')
}

exports.deleteCartItem = async (req, res) => {
  await Cart.destroy({ where: { id: req.params.id }, force: true })
  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
}

exports.getProductListFromIds = async (req, res) => {
  const prdouct = await Product.findAll({
    attributes: [
      'id',
      generateS3ConcatString('imageUrl', S3.PRODUCTS),
      'name',
      'price',
    ],
    where: { id: req.body.productIds },
  })

  if (prdouct.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, prdouct)
}

exports.placeOrder = async (req, res) => {
  const { orders, clientId } = req.body

  let totalItems = 0,
    orderTotal = 0

  const getProductPrice = await Product.findAll({
    attributes: ['id', 'price'],
    where: { id: orders.map(e => e.productId) },
  })

  orders.forEach(order => {
    const product = getProductPrice.find(e => e.id === order.productId)
    if (product) {
      orderTotal += product.price * order.quantity
      totalItems += order.quantity
    }
  })

  const clientDetail = await Client.findOne({
    attributes: [
      'state',
      'city',
      'city_id',
      'state_id',
      'state_iso2',
      'country',
      'country_iso2',
      'country_id',
    ],
    where: {
      id: clientId,
    },
  })

  if (!clientDetail) return notFoundError(res)

  const order = await Order.create({
    date: YYYY_MM_DD(),
    total_items: totalItems,
    order_total: orderTotal,
    orderTrackingStatus: ORDERS.TRACKING_STATUS.PENDING,
    paymentStatus: ORDERS.PAYMENT_STATUS.PENDING,
    clientId,
    state_id: clientDetail.state_id,
    state: clientDetail.state,
    state_iso2: clientDetail.state_iso2,
    city_id: clientDetail.city_id,
    city: clientDetail.city,
    country_id: clientDetail.country_id,
    country_iso2: clientDetail.country_iso2,
    country: clientDetail.country,
    teamId: req.user.id,
  })

  await Order_Item.bulkCreate(
    orders.map(e => {
      return {
        orderId: order.id,
        productId: e.productId,
        quantity: e.quantity,
      }
    }),
  )

  if (order) {
    // 7 = point id
    updateTeamMemberPoint(req.user.id, POINTS.TYPE.ORDER_TAKING)
    // 1 = take order
    updateTeamMemberTarget(req.user.id, TARGET.TYPE.TAKE_ORDER)

    // Truncate Cart as per clientId
    Cart.destroy({ where: { clientId }, force: true })
  }
  if (order) {
    return successResponse(res, 'Order Placed Successfully')
  } else {
    return unProcessableEntityRequestError(res, 'Please Add Item to the Cart')
  }
}

exports.getAllOrderList = async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20

  const { clientId, searchQuery, delivery, payment, orderDate } = req.query

  const filterCondition = {}
  const include = [
    {
      model: Team,
      attributes: ['name'],
    },
    {
      model: Client,
      attributes: ['name'],
    },
  ]

  if (clientId) {
    filterCondition.clientId = clientId
    include.pop()
  } else {
    if (searchQuery) {
      include[1].where = {
        name: {
          [Op.like]: `%${searchQuery}%`,
        },
      }
    }

    if (delivery) filterCondition.orderTrackingStatus = delivery
    if (payment) filterCondition.paymentStatus = payment

    if (orderDate && !clientId) {
      filterCondition[Op.and] = [
        // { date: date },
        sequelize.where(sequelize.fn('date', sequelize.col('date')), orderDate),
      ]
    }
  }

  const order = await Order.findAndCountAll({
    attributes: [
      'id',
      'date',
      'total_items',
      'order_total',
      'orderTrackingStatus',
      'paymentStatus',
    ],
    where: { ...filterCondition },
    offset: (currentPage - 1) * size,
    order: [['id', 'DESC']],
    limit: size,
    include: include,
  })

  if (order.count === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
    totalPage: order.count,
    orders: order.rows,
  })
}

exports.getAllItemsPerOrder = async (req, res) => {
  const orderDetail = await Order.findOne({
    attributes: [
      'id',
      'date',
      'total_items',
      'order_total',
      'orderTrackingStatus',
      'paymentStatus',
      'paymentMethod',
      'dispatch_date',
      'delivered_date',
    ],
    where: { id: req.params.orderId },
    include: [
      {
        model: Team,
        attributes: ['name'],
      },
      {
        model: Client,
        attributes: ['name', 'address', 'city', 'state'],
      },
      {
        model: Order_Item,
        attributes: ['id', 'quantity'],
        include: [
          {
            model: Product,
            paranoid: false,
            attributes: [
              'id',
              [
                sequelize.fn(
                  'CONCAT',
                  S3_CONFIG.AWS_S3_URL + S3.PRODUCTS,
                  '/',
                  sequelize.col('order_items.product.imageUrl'),
                ),
                'productImage',
              ],
              'name',
              'price',
            ],
          },
        ],
      },
    ],
    plain: true,
  })

  if (!orderDetail) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
    orderDetail,
    // orderitems,
  })
}

exports.updatePaymentStatus = async (req, res) => {
  const { status, method } = req.body

  const order = await Order.findOne({ where: { id: req.params.orderId } })

  if (!order) return notFoundError(res)

  if (
    order.paymentStatus == ORDERS.PAYMENT_STATUS.CONFIRMED &&
    status == ORDERS.PAYMENT_STATUS.PENDING
  )
    return forbiddenRequestError(res, 'Payment is already confirmed')

  const updateOrder = await order.update({
    paymentStatus: status,
    paymentMethod: method,
  })

  return successResponse(res, 'Payment Confirmed', {
    order: {
      status: updateOrder.paymentStatus,
      method: updateOrder.paymentMethod,
    },
  })
}

exports.updateOrderTrackingStatus = async (req, res) => {
  const { status } = req.body

  const order = await Order.findOne({ where: { id: req.params.orderId } })

  if (!order) return notFoundError(res)

  const updateBody = { orderTrackingStatus: status }

  if (status === ORDERS.TRACKING_STATUS.DISPATCH) {
    updateBody.dispatch_date = moment()
  } else if (status === ORDERS.TRACKING_STATUS.DELIVERED) {
    updateBody.delivered_date == moment()
  }

  const updateOrder = await order.update(updateBody)

  return successResponse(res, 'Status Updated', {
    order: {
      status: updateOrder.orderTrackingStatus,
      dispatch_date: updateBody.dispatch_date,
      delivered_date: updateBody.delivered_date,
    },
  })
}
