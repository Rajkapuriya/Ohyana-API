exports.SERVER_CONFIG = {
  PORT: process.env.PORT || 9009,
  ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_AlGORITHM: process.env.JWT_AlGORITHM,
  JWT_RESET_SECRET: process.env.JWT_RESET_SECRET,
  FRONTED_URL: process.env.FRONTED_URL,
  INDIAMART_CRM_KEY: process.env.INDIAMART_CRM_KEY,
}
