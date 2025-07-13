import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database';
import { handleSocket } from './services/socket';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

connectDB();

handleSocket(io);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});