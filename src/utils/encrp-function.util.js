const crypto = require('crypto')
const { ENCRYP_CONFIG } = require('../config/encryp.config')

const encrpPwdKey = crypto
  .createHash('sha512')
  .update(ENCRYP_CONFIG.SECRET_ENCRPPWD_KEY, 'utf-8')
  .digest('hex')
  .substring(0, 32)
const encrpPwdIv = crypto
  .createHash('sha512')
  .update(ENCRYP_CONFIG.SECRET_ENCRPPWD_IV, 'utf-8')
  .digest('hex')
  .substring(0, 16)

const encrpMergedPwdKey = crypto
  .createHash('sha512')
  .update(ENCRYP_CONFIG.SECRET_ENCRPMERGEDPWD_KEY, 'utf-8')
  .digest('hex')
  .substring(0, 32)
const encrpMergedPwdIv = crypto
  .createHash('sha512')
  .update(ENCRYP_CONFIG.SECRET_ENCRPMERGEDPWD_IV, 'utf-8')
  .digest('hex')
  .substring(0, 16)

function encrpPass(text, key, iv) {
  const encryptor = crypto.createCipheriv(
    ENCRYP_CONFIG.ENCRYPTION_ALGO,
    key,
    iv,
  )
  const aes_encrypted =
    encryptor.update(text, 'utf8', 'base64') + encryptor.final('base64')
  return Buffer.from(aes_encrypted).toString('base64')
}

function dcrpPass(encryptedMessage, key, iv) {
  const buff = Buffer.from(encryptedMessage, 'base64')
  encryptedMessage = buff.toString('utf-8')
  const decryptor = crypto.createDecipheriv(
    ENCRYP_CONFIG.ENCRYPTION_ALGO,
    key,
    iv,
  )
  return (
    decryptor.update(encryptedMessage, 'base64', 'utf8') +
    decryptor.final('utf-8')
  )
}

module.exports = {
  encrpPass,
  dcrpPass,
  encrpPwdKey,
  encrpPwdIv,
  encrpMergedPwdKey,
  encrpMergedPwdIv,
}
