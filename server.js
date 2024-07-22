const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('create or join', (roomId) => {
        console.log(`create or join to room ${roomId}`);

        const clients = io.sockets.adapter.rooms[roomId] || { length: 0 };
        const numClients = clients.length;

        if (numClients === 0) {
            socket.join(roomId);
            console.log(`Client ID ${socket.id} created room ${roomId}`);
            socket.emit('created', roomId);
        } else if (numClients === 1) {
            console.log(`Client ID ${socket.id} joined room ${roomId}`);
            io.sockets.in(roomId).emit('join', roomId);
            socket.join(roomId);
            socket.emit('joined', roomId);
        } else {
            socket.emit('full', roomId);
        }
    });

    socket.on('message', (message) => {
        console.log('Client said: ', message);
        io.sockets.in(message.roomId).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//test
