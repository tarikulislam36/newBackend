const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('create or join', (room) => {
        console.log(`Received request to create or join room ${room}`);
        const clients = io.sockets.adapter.rooms.get(room) || new Set();

        if (clients.size === 0) {
            socket.join(room);
            socket.emit('created', room);
        } else if (clients.size === 1) {
            socket.join(room);
            io.to(room).emit('join', room);
            socket.emit('joined', room);
        } else {
            socket.emit('full', room);
        }
    });

    socket.on('message', (message) => {
        console.log('Client said: ', message);
        socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

server.listen(3000, () => {
    console.log('server listening on port 3000');
});
