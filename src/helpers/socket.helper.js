let io
let sockets
module.exports = {
  init: server => {
    io = require('socket.io')(server, {
      // transports: ['polling'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })
    return io
  },
  setSocket: socket => {
    sockets = socket
  },
  getSocket: () => {
    if (!sockets) {
      throw new Error('Socket.io not initialized!')
    }
    return sockets
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!')
    }
    return io
  },
}
