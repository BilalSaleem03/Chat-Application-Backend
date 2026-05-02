import { Message, UnreadCount } from '../models/message.model.js';
import { Conversation }         from '../models/chat.model.js';
import { Group }                from '../models/chat.model.js';

export const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.user._id);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, text } = data;
        const senderId = socket.user._id;

        if (!conversationId || !text) {
          socket.emit('message_error', { error: 'conversationId and text are required' });
          return;
        }

        // Save message
        const saved = await Message.create({ conversationId, senderId, text });
        const newMessage = await Message.findById(saved._id)
          .populate('senderId', 'name username email image');

        // Get all participants to increment their unread counts
        const conversation = await Conversation.findById(conversationId)
          .populate('groupDetails', 'members');

        let participantIds = [];

        if (conversation.isGroup && conversation.groupDetails) {
          // Group: all members except sender
          participantIds = conversation.groupDetails.members
            .map(m => m.toString())
            .filter(id => id !== senderId.toString());
        } else {
          // Direct: the other participant
          participantIds = conversation.participants
            .map(p => p.toString())
            .filter(id => id !== senderId.toString());
        }

        // Increment unread count for each participant (upsert)
        await Promise.all(
          participantIds.map(userId =>
            UnreadCount.findOneAndUpdate(
              { conversationId, userId },
              { $inc: { count: 1 } },
              { upsert: true, new: true }
            )
          )
        );

        // Emit new message to everyone in the room
        io.to(conversationId).emit('receive_message', newMessage);

        // Emit unread_updated ONLY to recipients (never to sender)
        // participantIds already excludes the sender
        participantIds.forEach(recipientId => {
          // Only emit to users who are NOT currently in the conversation room
          // (if they are, they see the message live and don't need the badge)
          io.to(`user_${recipientId}`).emit('unread_updated', {
            conversationId: conversationId.toString(),
          });
        });

      } catch (error) {
        console.error('Error saving message:', error.message);
        socket.emit('message_error', { error: error.message });
      }
    });

    // Each user joins a personal room for real-time unread updates
    socket.on('join_user_room', () => {
      const userId = socket.user._id.toString();
      socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
    });
  });
};