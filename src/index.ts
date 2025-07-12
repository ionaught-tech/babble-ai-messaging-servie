import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI!)
    .then(() => {
        console.log('MongoDB connected');

        // Set up change stream for external-events
        const changeStream = ExternalEvent.watch();

        changeStream.on('change', (change) => {
            console.log('Change detected in external-events collection:', change);
            // Here you could, for example, emit the new message to all clients
            if (change.operationType === 'insert') {
                io.emit('new external event', change.fullDocument);
            }
        });

        changeStream.on('error', (error) => {
            console.error('Change stream error:', error);
        });
    })
    .catch(err => console.log(err));

// Message schema and model
const messageSchema = new mongoose.Schema({
    content: String,
    userId: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// ExternalEvent schema and model
const externalEventSchema = new mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
}, { collection: 'external-events' });

const ExternalEvent = mongoose.model('ExternalEvent', externalEventSchema);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
    const userId = socket.handshake.headers['user-id'];

    if (!userId) {
        console.log('Connection rejected: No user-id header');
        socket.disconnect();
        return;
    }

    console.log(`A user connected with userId: ${userId}`);

    socket.on('disconnect', () => {
        console.log(`User with userId: ${userId} disconnected`);
    });

    socket.on('chat message', async (msg: string) => {
        console.log(`message from ${userId}: ${msg}`);
        try {
            const newMessage = new Message({ content: msg, userId: userId });
            await newMessage.save();
            io.emit('chat message', { content: msg, userId: userId });
        } catch (error) {
            console.error('Error saving message to DB:', error);
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});