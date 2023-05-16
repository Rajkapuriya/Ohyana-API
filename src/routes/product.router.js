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
const productRouter = express.Router()

// ------------------------------- Product -------------------------------

productRouter.post(
  '/product',
  upload.single('product_image'),
  joiValidationMiddleware(productSchema.productForm),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editProduct',
  ),
  productController.createProduct,
)

productRouter.get(
  '/product',
  joiValidationMiddleware(productSchema.productList),
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.viewProduct'),
  productController.getAllProducts,
)

productRouter.get(
  '/product/:id',
  authTokenMiddleware,
  permissionHandleMiddleware('req.user.role.permission.viewProduct'),
  productController.getProductDetail,
)

productRouter.put(
  '/product/:id',
  upload.single('product_image'),
  joiValidationMiddleware(productSchema.productForm),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editProduct',
  ),
  productController.updateProduct,
)

productRouter.patch(
  '/product/:id',
  joiValidationMiddleware(productSchema.updateQuatity),
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.editProduct',
  ),
  productController.updateProductQuantity,
)

productRouter.delete(
  '/product/:id',
  authTokenMiddleware,
  permissionHandleMiddleware(
    'req.user.role.permission.settingMenu && req.user.role.permission.deleteProduct',
  ),
  productController.deleteProduct,
)

module.exports = productRouter
