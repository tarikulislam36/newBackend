const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);

    socket.on('create-room', (data) => {
        const { callId, receiverId, offer } = data;
        console.log('create-room:', data);
        socket.join(callId);
        socket.broadcast.to(receiverId).emit('offer', { offer });
    });

    socket.on('join-room', (data) => {
        const { callId } = data;
        console.log('join-room:', data);
        socket.join(callId);
        io.to(callId).emit('join', { callId });
    });

    socket.on('answer', (data) => {
        const { answer, callId } = data;
        console.log('answer:', data);
        socket.broadcast.to(callId).emit('answer', { answer });
    });

    socket.on('ice-candidate', (data) => {
        const { candidate, callId } = data;
        console.log('ice-candidate:', data);
        socket.broadcast.to(callId).emit('ice-candidate', { candidate });
    });

    socket.on('hangup', (data) => {
        const { callId } = data;
        console.log('hangup:', data);
        io.to(callId).emit('hangup');
        socket.leave(callId);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected: ' + socket.id);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
