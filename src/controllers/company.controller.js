const { Company } = require('../models')
const {
  successResponse,
  badRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE, S3 } = require('../constants')
const { uploadFileToS3, deleteFileFromS3 } = require('../helpers/s3.helper')
const { unlinkFile } = require('../utils/common.util')
const { generateS3ConcatString } = require('../utils/s3.util')

exports.updateCompanyProfile = async (req, res) => {
  const company = await Company.findOne({ where: { id: req.user.companyId } })
  if (!company) return notFoundError(res)

  let logoUrl
  if (req.file) {
    const result = await uploadFileToS3(req.file)
    logoUrl = result.Key.split('/')[1]
    if (company.logoUrl) {
      await deleteFileFromS3(company.logoUrl)
    }
    unlinkFile(req.file.path)
  }

  await company.update({ ...req.body, logoUrl })

  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.getCompanyProfile = async (req, res) => {
  const company = await Company.findOne({
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
      include: [generateS3ConcatString('logoUrl', S3.COMPANY_LOGO)],
    },
    where: { id: req.user.companyId },
  })

  if (!company) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, company)
}
