import { Server } from 'socket.io';

let io;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });
}

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

export {
  init,
  getIO
}
