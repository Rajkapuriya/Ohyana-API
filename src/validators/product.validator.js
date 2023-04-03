const Joi = require('joi')

exports.productSchema = {
  productForm: Joi.object({
    body: Joi.object({
      name: Joi.string().min(2).required(),
      price: Joi.number().required(),
      quantity: Joi.number().required(),
      weight: Joi.string(),
      materialType: Joi.string(),
      skuId: Joi.string(),
      description: Joi.string(),
    }).required(),
  }).unknown(),

  updateQuatity: Joi.object({
    body: Joi.object({
      quantity: Joi.number().required(),
    }).required(),
  }).unknown(),
}
