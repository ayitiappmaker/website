import { Schema, model, models } from 'mongoose';

const ChatHistorySchema = new Schema({
    role: String,
    content: String,
});

export const ChatHistory = models.ChatHistory || model('ChatHistory', ChatHistorySchema);
