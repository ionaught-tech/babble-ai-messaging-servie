import mongoose, { InferSchemaType, Schema } from "mongoose";


const schema = new Schema(
    {
        name: String,
        description: String,
        icon: String,
        services: String,
        rules: String,
        domain: String,
        model: String,
        phone: String,
        phoneId: String,
        whatsAppKey: String,
        metaDataToken: String,
        customPromptId: String,
        gptApiKey: String,
        isEmbed: {
            type: Boolean,
            default: false
        },
        embedFile: String,
        secondaryEmbedFile: [String],
        suggestedQuestions: [String],
        introMsg: String,
        prompt: String,
        flowId: {
            type: mongoose.Types.ObjectId,
            ref: "flow"
        },
        enabledSuggestions: {
            type: Boolean,
            default: false
        },
        isListed: Boolean,
        disabled: {
            type: Boolean,
            default: false
        },
        deleted: {
            type: Boolean,
            default: false
        },
        isDemoBot: Boolean,
        sections: [
            {
                key: String,
                prompt: String
            }
        ]
    },
    {
        timestamps: true
    }
);


export type ChatBot = InferSchemaType<typeof schema>;
export const ChatBotModel = mongoose.model<ChatBot>("ChatBot", schema);
