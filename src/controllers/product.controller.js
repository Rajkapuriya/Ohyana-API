const { Product, Cart } = require('../models')
const { Op } = require('sequelize')
const {
  successResponse,
  forbiddenRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE, S3 } = require('../constants')
const { unlinkFile } = require('../utils/common.util')
const { uploadFileToS3, deleteFileFromS3 } = require('../helpers/s3.helper')
const { generateS3ConcatString } = require('../utils/s3.util')

exports.createProduct = async (req, res) => {
  const existingProduct = await Product.findOne({
    where: { name: req.body.name, companyId: req.user.companyId },
  })

  if (existingProduct) {
    if (req.file) {
      unlinkFile(req.file.path)
    }
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)
  }

  let imageUrl = null
  if (req.file) {
    const result = await uploadFileToS3(req.file)
    unlinkFile(req.file.path)
    imageUrl = result.Key.split('/')[1]
  }

  await Product.create({ ...req.body, imageUrl, companyId: req.user.companyId })

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllProducts = async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20

  const { count: totalPage, rows: proudcts } = await Product.findAndCountAll({
    attributes: [
      'id',
      'name',
      'price',
      generateS3ConcatString('imageUrl', S3.PRODUCTS),
    ],
    where: { companyId: req.user.companyId },
    order: [['id', 'DESC']],
    offset: (currentPage - 1) * size,
    limit: size,
  })

  if (req.query.cart === 'true' && req.query.clientId) {
    const cartIdList = await Cart.findAll({
      attributes: ['productId', 'id'],
      where: { clientId: req.query.clientId },
    })

    for (let i = 0; i < proudcts.length; i++) {
      const isProductExists = cartIdList.find(
        c => c.productId === proudcts[i].id,
      )
      proudcts[i].dataValues.inCart = isProductExists ? true : false
      console.log()
      proudcts[i].dataValues.cartId = isProductExists
        ? isProductExists.id
        : null
    }
  }

  if (totalPage === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
    totalPage,
    proudcts,
  })
}

exports.getProductDetail = async (req, res) => {
  const product = await Product.findOne({
    attributes: [
      'id',
      'name',
      'price',
      generateS3ConcatString('imageUrl', S3.PRODUCTS),
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

  let imageUrl
  if (req.file) {
    const result = await uploadFileToS3(req.file)
    imageUrl = result.Key.split('/')[1]
    unlinkFile(req.file.path)
  }

  await Product.update(
    { ...req.body, imageUrl },
    { where: { id: req.params.id } },
  )

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
