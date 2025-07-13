import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import ExternalEvent from '../models/ExternalEvent';

export const handleSocket = (io: Server) => {
    const externalEventChangeStream = ExternalEvent.watch();

    externalEventChangeStream.on('change', (change) => {
        if (change.operationType === 'insert') {
            io.emit('new external event', change.fullDocument);
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');

        const userId = socket.handshake.headers['user-id'];

        if (!userId || Array.isArray(userId)) {
            console.log('User ID is missing or invalid. Disconnecting socket.');
            socket.disconnect();
            return;
        }

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('chat message', async (msg: string) => {
            const message = new Message({
                content: msg,
                userId: userId,
            });
            await message.save();
            io.emit('chat message', { content: msg, userId: userId });
        });
    });
};