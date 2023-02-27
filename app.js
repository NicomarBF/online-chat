const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var users = require('./users.json');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('connection report', (username) => {
        io.emit('chat message', `${username} se conectou no chat`);
        var user = {
            "id": socket.id,
            "username": username,
            "typing": false
        }
        users.push(user)
        io.emit('user list', users);
    });

    socket.on('typing report', () => {
        users.forEach(user => {
            if(user.id == socket.id){
                user.typing = true
            }
        })
        io.emit('user list', users);
    });

    socket.on('not typing report', () => {
        users.forEach(user => {
            if(user.id == socket.id){
                user.typing = false
            }
        })
        io.emit('user list', users);
    });

    socket.on('disconnect', () => {
        const user = users.find(user => user.id === socket.id);
        io.emit('chat message', `${user.username} se desconectou no chat`);
        users = users.filter(user => user.id !== socket.id);
        console.log(`${user.username} disconnected`)
    });
});

server.listen(8080, () => {
    console.log('listening on *:8080');
});