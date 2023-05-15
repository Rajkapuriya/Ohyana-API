exports.SERVER_CONFIG = {
  PORT: process.env.PORT || 9009,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_AlGORITHM: process.env.JWT_AlGORITHM,
  JWT_RESET_SECRET: process.env.JWT_RESET_SECRET,
}
