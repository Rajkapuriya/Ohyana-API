const redis = require('redis')
const { REDIS_CONFIG } = require('../../config/redis.config')

const redisClient = redis.createClient({
  url: REDIS_CONFIG.REDIS_URL,
  password: REDIS_CONFIG.REDIS_PASSWORD,
})

redisClient.connect()

redisClient.on('error', error => {
  console.log('Redis Error', error)
})

async function setRedisData(key, value) {
  // await redisClient.set(key,value)
  // console.log([key,value])
  await redisClient.sAdd(key, value.toString())
}

async function getRedisData(key) {
  //    const data = await redisClient.get(key)
  const data = await redisClient.SMEMBERS(key)
  return data
}

async function getAllKeyValuePair() {
  //    const data = await redisClient.get(key)
  const keys = await redisClient.keys('*')
  // const data = await redisClient.SMEMBERS(key)
  // return data
  return keys
}

function getAsyncValue(key) {
  return redisClient.SMEMBERS(key)
}

async function deleteKey(key) {
  redisClient.del(key)
}

module.exports = {
  setRedisData,
  getRedisData,
  getAllKeyValuePair,
  getAsyncValue,
  deleteKey,
}
