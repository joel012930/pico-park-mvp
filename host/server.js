const http = require('http');
const fs = require('fs');
const io = require('socket.io');

const server = http.createServer((req, res) => {
    // Sirve el index.html automáticamente
    fs.readFile('index.html', (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });
});

const socketServer = io(server, { cors: { origin: "*" } });

socketServer.on('connection', (socket) => {
    console.log('📱 Mando conectado');
    socket.on('keydown', (key) => socketServer.emit('remote_keydown', key));
    socket.on('keyup', (key) => socketServer.emit('remote_keyup', key));
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Servidor activo en http://10.56.2.21:3000');
});