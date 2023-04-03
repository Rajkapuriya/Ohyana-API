require('dotenv').config()
require('express-async-errors')
require('./utils/cron.util')

const sequelize = require('./database/mysql')
const cors = require('cors')
const morgan = require('./config/morgan.config')
const io = require('./helpers/socket.helper')
const { SERVER_CONFIG } = require('./config/server.config')

const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))
app.use(cors())
app.use('/uploads/', express.static('uploads'))

app.use('/', require('./routes'))

app.use((err, req, res, next) => {
  console.log(err)
  let errorBody = {
    message: 'Internal Server Error',
  }

  if (!err.statusCode) {
    err.statusCode = 500
  }

  io.getIO().emit('reJoin', { message: 'Rejoin The Room' })

  if (SERVER_CONFIG.ENV === 'development') {
    errorBody = {
      message: err.message,
      data: err.stack,
    }
  }

  res.status(err.statusCode).json({ success: false, ...errorBody })
})

sequelize
  .sync()
  .then(() => {
    const server = app.listen(SERVER_CONFIG.PORT, () =>
      console.log(`Successfully Connected on Port ${SERVER_CONFIG.PORT}`),
    )
    const io = require('./helpers/socket.helper').init(server)
    io.on('connection', socket => {
      console.log('Client connected')
      socket.on('join', function (data) {
        console.log(`${data.email} Joined To Room`)
        socket.join(data.email) // We are using room of socket
      })

      socket.on('leave', function (room) {
        try {
          console.log('[socket]', 'leave room :', room.email)
          socket.leave(room.email)

          socket.to(room.email).emit('user left', socket.id)
        } catch (e) {
          console.log('[error]', 'leave room :', e)
          socket.emit('error', 'couldnt perform requested action')
        }
      })
      require('./helpers/socket.helper').setSocket(socket)
    })
  })
  .catch(err => console.log(err))
