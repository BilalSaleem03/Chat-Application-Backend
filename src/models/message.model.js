import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',         required: true },
  text:           { type: String, required: true },
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);


// Tracks unread message count per user per conversation
const unreadSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User',         required: true },
  count:          { type: Number, default: 0 },
}, { timestamps: true });

// Compound unique index — one record per user per conversation
unreadSchema.index({ conversationId: 1, userId: 1 }, { unique: true });

export const UnreadCount = mongoose.model('UnreadCount', unreadSchema);