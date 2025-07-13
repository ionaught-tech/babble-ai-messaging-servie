import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import ExternalEvent from '../models/ExternalEvent';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

export const handleSocket = (io: Server) => {
    const externalEventChangeStream = ExternalEvent.watch();

    externalEventChangeStream.on('change', (change: any) => {
        if (change.operationType === 'insert') {
            logger.info('New external event', { fullDocument: change.fullDocument });
            io.emit('new external event', change.fullDocument);
        }
    });

    io.on('connection', (socket: Socket) => {
        const sessionId = uuidv4();
        logger.info(`A user connected with session ID: ${sessionId}`);

        const userId = socket.handshake.headers['user-id'];

        if (!userId || Array.isArray(userId)) {
            logger.warn('User ID is missing or invalid. Disconnecting socket.', { sessionId });
            socket.disconnect();
            return;
        }

        socket.on('disconnect', () => {
            logger.info(`User disconnected with session ID: ${sessionId}`);
        });

        socket.on('chat message', async (msg: string) => {
            const message = new Message({
                content: msg,
                userId: userId,
            });
            await message.save();
            logger.info('New message saved', { message, sessionId });
            io.emit('chat message', { content: msg, userId: userId });
        });
    });
};