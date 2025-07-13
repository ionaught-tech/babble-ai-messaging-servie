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

app.get('/health-check', (_req, res) => {
    res.send('OK');
});

app.get('/version', (_req, res) => {
    const version = process.env.VERSION || process.env.npm_package_version;
    res.send(version);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});