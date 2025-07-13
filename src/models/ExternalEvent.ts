import mongoose from 'mongoose';

const ExternalEventSchema = new mongoose.Schema({
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
}, { timestamps: true });

export default mongoose.model('ExternalEvent', ExternalEventSchema);