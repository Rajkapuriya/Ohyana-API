const { S3_CONFIG } = require('../config/s3.config')
const { S3 } = require('../constants')
const sequelize = require('../database/mysql')

function generateS3KeyPath(file, key) {
  if (file.fieldname === 'profile_image') {
    key = `${S3.USERS.substring(1)}/user-${file.filename}`
  } else if (file.fieldname === 'product_image') {
    key = `${S3.PRODUCTS.substring(1)}/product-${file.filename}`
  } else if (file.fieldname === 'status_audio_file') {
    key = `${S3.CUSTOMERS.substring(1)}/status_audio-${file.filename}`
  } else if (file.fieldname === 'expense_file') {
    key = `${S3.USERS.substring(1)}/expense-${file.filename}`
  }

  return key
}

function generateS3ConcatString(columnName, s3Path) {
  return [
    sequelize.fn(
      'CONCAT',
      S3_CONFIG.AWS_S3_URL + s3Path,
      '/',
      sequelize.col(columnName),
    ),
    columnName,
  ]
}

module.exports = {
  generateS3KeyPath,
  generateS3ConcatString,
}
