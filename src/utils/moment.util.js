const moment = require('moment')

function YYYY_MM_DDHHMM(date) {
  return getDate(date, 'YYYY-MM-DD HH:mm')
}

function YYYY_MM_DD_HHMM(date) {
  return getDate(date, 'YYYY-MM-DD_HH:mm')
}

function YYYY_MM_DD(date) {
  return getDate(date, 'YYYY-MM-DD')
}

function HH_MM_SS(date) {
  return getDate(date, 'HH:mm:ss')
}

function YYYY_MM_DD_HHMMSS(date) {
  return getDate(date, 'YYYY-MM-DD HH:mm:ss')
}

function YYYY_MM_DD_HH_MM(date) {
  return getDate(date, 'YYYY-MM-DD_HH_mm')
}

function getDate(date, format) {
  if (date) {
    return moment(date).format(format)
  } else {
    return moment().format(format)
  }
}

module.exports = {
  YYYY_MM_DDHHMM,
  YYYY_MM_DD_HHMM,
  YYYY_MM_DD,
  HH_MM_SS,
  YYYY_MM_DD_HHMMSS,
  YYYY_MM_DD_HH_MM,
}
