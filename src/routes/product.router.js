const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { productSchema } = require('../validators/product.validator')
const productController = require('../controllers/product.controller')

const express = require('express')
const { upload } = require('../middleware/multer.middleware')
const { TEAM } = require('../constants')
const productRouter = express.Router()

// ------------------------------- Product -------------------------------

productRouter.post(
  '/product',
  upload.single('product_image'),
  joiValidationMiddleware(productSchema.productForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_PRODUCT]),
  productController.createProduct,
)

productRouter.get(
  '/product',
  joiValidationMiddleware(productSchema.productList),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_PRODUCT]),
  productController.getAllProducts,
)

productRouter.get(
  '/product/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_PRODUCT]),
  productController.getProductDetail,
)

productRouter.put(
  '/product/:id',
  upload.single('product_image'),
  joiValidationMiddleware(productSchema.productForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_PRODUCT]),
  productController.updateProduct,
)

productRouter.patch(
  '/product/:id',
  joiValidationMiddleware(productSchema.updateQuatity),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_PRODUCT]),
  productController.updateProductQuantity,
)

productRouter.delete(
  '/product/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.DELETE_PRODUCT]),
  productController.deleteProduct,
)

module.exports = productRouter
