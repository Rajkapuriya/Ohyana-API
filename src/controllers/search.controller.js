const { Op } = require('sequelize')
const { MESSAGE } = require('../constants/message.contant')
const { Country, Client, Team } = require('../models')
const { successResponse, notFoundError } = require('../utils/response.util')

// Get All Country
exports.getCoutries = async (req, res) => {
  const country = await Country.findAll({ attributes: ['id', 'name'] })
  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, country)
}

exports.getCities = async (req, res) => {
  const { searchQuery } = req.query

  const searchList = await getSearchData('city', searchQuery)

  if (searchList.length === 0) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    searchList,
  )
}

exports.getStates = async (req, res) => {
  const { searchQuery } = req.query

  const searchList = await getSearchData('state', searchQuery)

  if (searchList.length === 0) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    searchList,
  )
}

async function getSearchData(type, searchQuery) {
  const whereCondition = { [type]: { [Op.ne]: null } }

  if (searchQuery) {
    whereCondition[type] = {
      [Op.like]: `%${searchQuery}%`,
    }
  }

  const clientCities = await Client.findAll({
    attributes: [type],
    where: whereCondition,
    limit: 5,
    group: [type],
  })

  const teamCities = await Team.findAll({
    attributes: [type],
    where: whereCondition,
    limit: 5,
    group: [type],
  })

  return clientCities.map(e => e[type]).concat(teamCities.map(e => e[type]))
}
