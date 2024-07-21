const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = 3000;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('create or join', (room) => {
        console.log(`Request to create or join room: ${room}`);
        const clients = io.sockets.adapter.rooms.get(room) || new Set();
        const numClients = clients.size;

        if (numClients === 0) {
            socket.join(room);
            socket.emit('created', room);
            console.log(`Room ${room} created by ${socket.id}`);
        } else if (numClients === 1) {
            socket.join(room);
            socket.emit('joined', room);
            io.to(room).emit('ready');
            console.log(`${socket.id} joined room ${room}`);
        } else {
            socket.emit('full', room);
            console.log(`Room ${room} is full`);
        }
    });

    socket.on('message', (message) => {
        console.log(`Message from ${socket.id}:`, message);
        socket.to(message.room).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

app.get('/test', (req, res) => {
    res.send('Test request successful!');
    console.log('Test request received');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
