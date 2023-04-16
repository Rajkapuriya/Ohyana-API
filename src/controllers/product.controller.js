const { Product } = require('../models')
const { Op } = require('sequelize')
const {
  successResponse,
  forbiddenRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants')

exports.createProduct = async (req, res) => {
  const [, created] = await Product.findOrCreate({
    where: { name: req.body.name, companyId: req.user.companyId },
    defaults: { ...req.body, companyId: req.user.companyId },
  })

  if (!created)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllProducts = async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20

  const products = await Product.findAndCountAll({
    attributes: ['id', 'name', 'price', 'imageUrl'],
    where: { companyId: req.user.companyId },
    order: [['id', 'DESC']],
    offset: (currentPage - 1) * size,
    limit: size,
  })

  const data = { totalPage: products.count, products: products.rows }

  if (data.totalPage === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, data)
}

exports.getProductDetail = async (req, res) => {
  const product = await Product.findOne({
    attributes: [
      'id',
      'name',
      'price',
      'imageUrl',
      'quantity',
      'weight',
      'materialType',
      'skuId',
      'description',
    ],
    where: { id: req.params.id },
  })

  if (!product) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, product)
}

exports.updateProduct = async (req, res) => {
  const existedProduct = await Product.findOne({
    where: {
      name: req.body.name,
      companyId: req.user.companyId,
      id: {
        [Op.ne]: req.params.id,
      },
    },
  })
  if (existedProduct)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  await Product.update(req.body, { where: { id: req.params.id } })

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY,
    // updateProduct,
  )
}

exports.updateProductQuantity = async (req, res) => {
  const updateProduct = await Product.updateProduct(req.body, req.params.id)
  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY,
    updateProduct,
  )
}

exports.deleteProduct = async (req, res) => {
  await Product.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
}
