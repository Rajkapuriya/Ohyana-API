const Joi = require('joi')

exports.pjpSchema = {
  pjpForm: Joi.object({
    body: Joi.object({
      date: Joi.string().required(),
      latitude: Joi.string(),
      longitude: Joi.string(),
      description: Joi.string().required(),
      clientId: Joi.number().required(),
      teamId: Joi.number(),
    }).required(),
  }).unknown(),

  updatePjp: Joi.object({
    body: Joi.object({
      date: Joi.string(),
      pjpId: Joi.number().required(),
      description: Joi.string(),
    }).required(),
  }).unknown(),

  pjpStatusForm: Joi.object({
    body: Joi.object({
      description: Joi.string().min(5).required(),
      followUpType: Joi.string()
        .valid('FIELD', 'CALL', 'WHATSAPP', 'OTHER')
        .required(),
      clientId: Joi.number().required(),
    }).required(),
  }).unknown(),

  pjpCompletionStatusForm: Joi.object({
    body: Joi.object({
      description: Joi.string().min(5).required(),
      latitude: Joi.string(),
      longitude: Joi.string(),
      pjpId: Joi.number().required(),
      // status: Joi.string().valid('COMPLETED', 'POST-POND').required(),
    }).required(),
  }).unknown(),

  pjpList: Joi.object({
    query: Joi.object({
      page: Joi.number(),
      size: Joi.number(),
      teamId: Joi.number(),
      statusType: Joi.string(),
      date: Joi.string(),
      day: Joi.string(),
      clientId: Joi.number(),
      state_id: Joi.number(),
      city_id: Joi.number(),
      followUpType: Joi.string(),
    }).required(),
  }).unknown(),

  pjpStatusList: Joi.object({
    query: Joi.object({
      page: Joi.number(),
      size: Joi.number(),
      clientId: Joi.number().required(),
      followUpType: Joi.string(),
    }).required(),
  }).unknown(),
}
