const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')
const { S3_CONFIG } = require('../config/s3.config')

const s3 = new S3({
  region: S3_CONFIG.AWS_REGION,
  accessKeyId: S3_CONFIG.AWS_ACCESS_KEY,
  secretAccessKey: S3_CONFIG.AWS_SECRET,
})

// Upload Files To S3

function uploadFileToS3(file) {
  const fileStream = fs.createReadStream(file.path)

  const uploadParams = {
    Bucket: S3_CONFIG.AWS_REGION,
    Body: fileStream,
    Key: file.filename,
  }

  return s3.upload(uploadParams).promise()
}

// Download Files from S3

function getFileFromS3(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: S3_CONFIG.AWS_REGION,
  }

  return s3.getObject(downloadParams).createReadStream()
}

// Delete File from S3

function deleteFileFromS3(fileKey) {
  const deleteParams = {
    Key: fileKey,
    Bucket: S3_CONFIG.AWS_REGION,
  }

  return s3.deleteObject(deleteParams).promise()
}

module.exports = {
  uploadFileToS3,
  getFileFromS3,
  deleteFileFromS3,
}
