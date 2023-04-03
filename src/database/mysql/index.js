const { Sequelize } = require('sequelize')
const { MYSQL_CONFIG } = require('../../config/mysql.config')

const sequelize = new Sequelize(
  MYSQL_CONFIG.DB,
  MYSQL_CONFIG.USER,
  MYSQL_CONFIG.PASSWORD,
  {
    host: MYSQL_CONFIG.HOST,
    dialect: MYSQL_CONFIG.dialect,
    logging: false,
    dialectOptions: {
      // useUTC: false, //for reading from database
      timezone: MYSQL_CONFIG.timeZone,
    },
    timezone: MYSQL_CONFIG.timeZone, // for writing to database
  },
)

sequelize
  .authenticate()
  .then(() => {
    console.log('successfully connected with database')
  })
  .catch(err => {
    console.log(`ERROR : ${err}`)
  })

module.exports = sequelize
