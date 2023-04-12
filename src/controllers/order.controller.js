const { Cart, Order, Order_Item, Product, Team, Client } = require('../models')
const {
  unProcessableEntityRequestError,
  successResponse,
  forbiddenRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants/message.contant')
const { YYYY_MM_DD } = require('../utils/moment.util')
const {
  updateTeamMemberPoint,
  updateTeamMemberTarget,
} = require('../utils/common.util')
const { Op } = require('sequelize')
const sequelize = require('../database/mysql')

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body

  const alreadyInCart = await Cart.findOne({
    where: { productId, teamId: req.user.id },
  })
  if (alreadyInCart) {
    // await alreadyInCart.update({ quantity: Sequelize.literal(`case when ${quantity} < 0 then 0 else remainDays + ${rdc} end`) },
    //     { where: whereClause, transaction: t })
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)
  } else {
    await Cart.create({ productId, teamId: req.user.id, quantity: quantity })
    return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
  }
}

exports.updateCartProductQuatity = async (req, res) => {
  const { productId, quantity, cartId } = req.body

  await Cart.update({ quantity }, { where: { productId, id: cartId } })
  return successResponse(res, 'Quantity updated Successfully')
}

exports.getAllCartItem = async (req, res) => {
  const cart = await Cart.findAll({
    attributes: ['id', 'quantity'],
    where: { teamId: req.user.id },
    include: [
      {
        model: Product,
        attributes: ['imageUrl', 'name', 'price'],
      },
    ],
  })

  if (cart.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, cart)
}

exports.getProductListFromIds = async (req, res) => {
  const prdouct = await Product.findAll({
    attributes: ['id', 'imageUrl', 'name', 'price'],
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

  const order = await Order.create({
    date: YYYY_MM_DD(),
    total_items: totalItems,
    order_total: orderTotal,
    orderTrackingStatus: 'PENDING',
    paymentStatus: 'PENDING',
    clientId,
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
    updateTeamMemberPoint(req.user.id, 7)
    // 1 = take order
    updateTeamMemberTarget(req.user.id, 1)
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
            attributes: ['id', 'imageUrl', 'name', 'price'],
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

  if (order.paymentStatus == 'CONFIRMED' && status == 'PENDING')
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

  if (order.orderTrackingStatus == 'DISPATCH' && status == 'PENDING')
    return forbiddenRequestError(res, 'Order is already dispatched')

  const updateOrder = await order.update({
    orderTrackingStatus: status,
  })

  return successResponse(res, 'Status Updated', {
    order: {
      status: updateOrder.orderTrackingStatus,
    },
  })
}
