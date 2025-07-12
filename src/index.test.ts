import request from 'supertest';
import http from 'http';
import { Server } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import express from 'express';

interface MessagePayload {
    content: string;
    userId: string;
}

let server: http.Server;
let io: Server;
let app: express.Express;
let clientSocket: ClientSocket;

beforeAll((done) => {
    app = express();
    server = http.createServer(app);
    io = new Server(server);
    app.get('/', (req, res) => {
        res.send('<h1>Hello world</h1>');
    });
        server.listen(() => {
        const port = (server.address() as any).port;
        clientSocket = ioc(`http://localhost:${port}`, {
            extraHeaders: {
                'user-id': 'test-user'
            }
        });
        clientSocket.on('connect', done);
    });
});

afterAll((done) => {
    io.close();
    clientSocket.close();
    server.close(done);
});

describe('Socket.IO', () => {
    test('should receive a message', (done) => {
                clientSocket.on('chat message', (arg: MessagePayload) => {
            expect(arg).toEqual({ content: 'hello', userId: 'test-user' });
            done();
        });
        io.emit('chat message', { content: 'hello', userId: 'test-user' });
    });
});

describe('GET /', () => {
    it('should return 200 OK with "Hello world"', async () => {
        const res = await request(server).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toBe('<h1>Hello world</h1>');
    });
});