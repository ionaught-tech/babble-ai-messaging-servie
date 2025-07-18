import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import { ExternalEvent, ExternalEventModel } from '../models/ExternalEvents';
import logger from '../config/logger';
import { ChatBot, ChatBotModel } from '../models/ChatBot';
import { getMedia, getMediaUrl } from '../integrations/whatsapp';
import { uploadS3 } from '../integrations/aws/s3';
import { Readable } from 'stream';
import { sendWhatsAppMessage } from '../integrations/whatsapp/send';

export const handleSocket = (io: Server) => {
    const externalEventChangeStream = ExternalEventModel.watch();

    externalEventChangeStream.on('change', async (change: { fullDocument: ExternalEvent, operationType: string }) => {
        if (change.operationType === 'insert') {
            // logger.info('New external event', { fullDocument: change.fullDocument });
            // io.emit('new external event', change.fullDocument);
            // if( change.fullDocument.entry[0] ) {
            const entry = change.fullDocument.entry?.[0]?.changes?.[0];
            if (!entry || entry.field !== 'messages') return;

            const phoneId = entry.value?.metadata?.phone_number_id;
            const sender = entry.value?.contacts?.[0]?.wa_id;
            if (!phoneId || !sender) return;
            const message = entry.value?.messages?.[0];
            if (!message) return;
            const chatBot: ChatBot | null = await ChatBotModel.findOne({ phoneId: phoneId });
            if (!chatBot) {
                logger.warn('ChatBot not found for phoneId', { phoneId });
                return;
            }
            if (!chatBot.whatsAppKey) return;
            if (message.type === 'image' || message.type === 'video' || message.type === 'document' || message.type === 'audio') {
                const mediaId = message[message.type]?.id;
                if (!mediaId) return;
                const mediaUrl = await getMediaUrl(mediaId, chatBot.whatsAppKey);
                if (mediaUrl) {
                    const media = await getMedia(mediaUrl, chatBot.whatsAppKey);
                    if (media) {
                        if (media.body) {
                            const key = `whatsapp/${phoneId}/${mediaId}`;
                            await uploadS3({
                                Bucket: 'assets.babble-ai.com',
                                Key: key,
                                Body: Readable.fromWeb(media.body as any),
                                ContentLength: Number(media.headers.get('content-length')) || 0,
                                ContentType: media.headers.get('content-type') || 'application/octet-stream',
                            });
                            io.emit('message', {
                                type: 'media',
                                mediaType: message.type,
                                url: `https://assets.babble-ai.com/${key}`,
                                caption: message[message.type]?.caption || '',
                                filename: message[message.type]?.filename || '',
                            });
                        }
                    }
                }
                return;
            }
            console.log('message', message);
            
            io.emit('message', {
                type: message?.type || 'text',
                body: message?.text?.body
            });
            // sendWhatsAppMessage(
            //     {
            //         phoneId,
            //         to: sender,
            //         token: chatBot.whatsAppKey,
            //         type: 'text',
            //         message: 'New external event received',
            //     }
            // );
            
        }
    });

    io.on('connection', (socket: Socket) => {
        logger.info('A user connected');

        const userId = socket.handshake.headers['user-id'];

        if (!userId || Array.isArray(userId)) {
            logger.warn('User ID is missing or invalid. Disconnecting socket.');
            socket.disconnect();
            return;
        }

        socket.on('disconnect', () => {
            logger.info('User disconnected');
        });

        socket.on('message', async (msg: string) => {
            const phoneId = '101865152851273';
            const to = '918157815725';
            const chatBot: ChatBot | null = await ChatBotModel.findOne({ phoneId: phoneId });
            if(!chatBot || !chatBot.whatsAppKey) return;
            const message = JSON.parse(msg);
            await sendWhatsAppMessage(
                {
                    phoneId,
                    to,
                    token: chatBot.whatsAppKey,
                    type: message.type || 'text',
                    message: message.body || '',
                    mediaUrl: message.mediaUrl,
                    mediaType: message.mediaType,
                    filename: message.filename,
                    interactive: message.interactive || undefined,
                }
            );
        });
    });
};