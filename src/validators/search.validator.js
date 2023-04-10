const Joi = require('joi')

exports.searchSchema = {
  stateCitySearchList: Joi.object({
    query: Joi.object({
      searchQuery: Joi.string(),
    }).required(),
  }).unknown(),
}
