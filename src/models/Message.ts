import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.model('TestMessage', MessageSchema);