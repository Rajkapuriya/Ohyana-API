const morgan = require('morgan')

// ---- Morgan Configuration -----

morgan.token('date', function () {
  const p = new Date()
    .toString()
    .replace(/[A-Z]{3}\+/, '+')
    .split(/ /)
  return p[2] + '/' + p[1] + '/' + p[3] + ':' + p[4] + ' ' + p[5]
})

morgan.format(
  'logFormat',
  `
  Method          =>  :method 
  Url             =>  :url 
  Status Code     =>  :status
  Content-Length  =>  :res[content-length]
  Remote-Address  =>  :remote-addr 
  Response-Time   =>  :response-time ms 
  Date            =>  :date`,
)

module.exports = morgan
