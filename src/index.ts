import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database';
import { handleSocket } from './services/socket';
import addRequestId from 'express-request-id';
import expressWinston from 'express-winston';
import logger from './config/logger';

const app = express();
app.use(addRequestId());

app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
}));
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
    logger.info(`listening on *:${PORT}`);
});