import { Schema, model, InferSchemaType } from 'mongoose';

/** Sub-schemas **/

const ContactSchema = new Schema({
    profile: {
        name: String,
        wa_id: String
    },
    wa_id: String,
}, { _id: false });

const ContextSchema = new Schema({
    from: String,
    id: String,
    wamid: String,
}, { _id: false });

const TextSchema = new Schema({
    body: String
}, { _id: false });

const ReactionSchema = new Schema({
    message_id: String,
    emoji: String
}, { _id: false });

const ButtonSchema = new Schema({
    payload: String,
    text: String
}, { _id: false });

const InteractiveSchema = new Schema({
    type: String,
    button_reply: {
        id: String,
        title: String
    },
    list_reply: {
        id: String,
        title: String,
        description: String
    },
    nfm_reply: {
        name: String,
        body: String,
        response_json: String
    }
}, { _id: false });

const ReferralSchema = new Schema({
    source_url: String,
    source_type: String,
    source_id: String,
    headline: String,
    media_type: String,
    image_url: String
}, { _id: false });

const ErrorSchema = new Schema({
    code: Number,
    title: String,
    detail: String
}, { _id: false });

const MediaSchema = new Schema({
    id: String,
    mime_type: String,
    sha256: String,
    caption: String,
    filename: String,
    link: String
}, { _id: false });

const MessageSchema = new Schema({
    id: String,
    from: String,
    to: String,
    timestamp: String,
    type: String,
    text: TextSchema,
    reaction: ReactionSchema,
    button: ButtonSchema,
    interactive: InteractiveSchema,
    context: ContextSchema,
    referral: ReferralSchema,
    image: MediaSchema,
    video: MediaSchema,
    document: MediaSchema,
    audio: MediaSchema,
    errors: [ErrorSchema]
}, { _id: false });

const StatusSchema = new Schema({
    id: String,
    recipient_id: String,
    status: String,
    timestamp: String,
    conversation: {
        id: String,
        expiration_timestamp: String,
        origin: {
            type: { type: String }
        }
    },
    pricing: {
        pricing_model: String,
        billable: Boolean,
        category: String
    }
}, { _id: false });

const ChangeValueSchema = new Schema({
    messaging_product: String,
    metadata: {
        display_phone_number: String,
        phone_number_id: String
    },
    contacts: [ContactSchema],
    messages: [MessageSchema],
    statuses: [StatusSchema],
    errors: [ErrorSchema]
}, { _id: false });

const EntrySchema = new Schema({
    id: String,
    changes: [{
        field: String,
        value: ChangeValueSchema
    }]
}, { _id: false });

const ExternalEventSchema = new Schema({
    object: { type: String },
    entry: [EntrySchema]
}, {
    timestamps: true,
    collection: 'external-events'
});

export type ExternalEvent = InferSchemaType<typeof ExternalEventSchema>;
export const ExternalEventModel = model<ExternalEvent>('ExternalEvent', ExternalEventSchema);