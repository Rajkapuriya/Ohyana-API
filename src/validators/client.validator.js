const Joi = require('joi')

exports.clientSchema = {
  clientForm: Joi.object({
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().allow(null, ''),
      reference: Joi.string()
        // .valid('INDIAMART', 'WEBSITE', 'OFFICE', 'OTHER')
        .allow(null, ''),
      reference_name: Joi.string().allow(null, ''),
      business: Joi.string().allow(null, ''),
      contact_number: Joi.string()
        .regex(/[^a-zA-Z!@#$%^&*]/)
        .allow(null, ''),
      isInternational: Joi.boolean().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      address: Joi.string().allow(null, ''),
      countryId: Joi.number().allow(null, ''),
      max_invesment_amount: Joi.number(),
    })
      .or('email', 'contact_number')
      .required(),
  }).unknown(),

  clientList: Joi.object({
    query: Joi.object({
      isInternational: Joi.boolean(),
      stage: Joi.number(),
      tabType: Joi.string(),
      forMobile: Joi.boolean(),
      selection: Joi.boolean(),
      searchQuery: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      page: Joi.number(),
      size: Joi.number(),
    }).required(),
  }).unknown(),

  stage: Joi.object({
    body: Joi.object({
      stage: Joi.number().required(),
    }).required(),
  }).unknown(),

  addClientStatus: Joi.object({
    body: Joi.object({
      description: Joi.string().min(5).required(),
      clientId: Joi.number().required(),
      followUpType: Joi.string()
        .valid('FIELD', 'CALL', 'WHATSAPP', 'EMAIL', 'OTHER')
        .required(),
      callNotReceived: Joi.boolean().allow(null),
    }).required(),
  }).unknown(),

  updatedClientStatus: Joi.object({
    body: Joi.object({
      description: Joi.string().min(5).required(),
      statusId: Joi.number().required(),
    }).required(),
  }).unknown(),

  closeClientInquiry: Joi.object({
    body: Joi.object({
      description: Joi.string().min(3).required(),
      clientId: Joi.number().required(),
    }).required(),
  }).unknown(),

  addClientReminder: Joi.object({
    body: Joi.object({
      description: Joi.string().min(5).required(),
      date: Joi.string(),
      time: Joi.string(),
      clientId: Joi.number().required(),
    }).required(),
  }).unknown(),

  updateClientReminder: Joi.object({
    body: Joi.object({
      description: Joi.string().min(5).required(),
      date: Joi.string(),
      time: Joi.string(),
      reminderId: Joi.number().required(),
    }).required(),
  }).unknown(),

  addClientAppointment: Joi.object({
    body: Joi.object({
      description: Joi.string().min(5).required(),
      appointment_unit: Joi.string(),
      date: Joi.string(),
      appointed_member: Joi.array(),
      time: Joi.string(),
      clientId: Joi.number().required(),
    }).required(),
  }).unknown(),

  updatedClientAppointment: Joi.object({
    body: Joi.object({
      description: Joi.string().min(5).required(),
      appointment_unit: Joi.string(),
      date: Joi.string(),
      appointed_member: Joi.array(),
      time: Joi.string(),
      appointmentId: Joi.number().required(),
    }).required(),
  }).unknown(),
}
