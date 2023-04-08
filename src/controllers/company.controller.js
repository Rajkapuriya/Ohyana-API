const { Company, Country } = require('../models')
const {
  successResponse,
  badRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants/message.contant')

exports.updateCompanyProfile = async (req, res) => {
  const company = await Company.findOne({ where: { id: req.user.companyId } })
  if (!company) return notFoundError(res)

  await company.update(req.body)

  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.getCompanyProfile = async (req, res) => {
  const company = await Company.findOne({
    attributes: { exclude: ['createdAt', 'updatedAt', 'countryId'] },
    where: { id: req.user.companyId },
    include: [{ model: Country, attributes: ['name'] }],
  })

  if (!company) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, company)
}
