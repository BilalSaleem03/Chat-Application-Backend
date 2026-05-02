import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  image:       { type: String },   // Cloudinary URL
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admin:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup:      { type: Boolean, default: false },
  groupDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  image:        { type: String },  // optional contact image (Cloudinary URL)
}, { timestamps: true });

export const Group        = mongoose.model('Group',        groupSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);