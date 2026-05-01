import { Message } from '../models/message.model.js';


export const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Authenticated user ${socket.user.id} connected`);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, text } = data;
        const senderId = socket.user.id; // Securely retrieved from the JWT

        const newMessage = await Message.create({ 
          conversationId, 
          senderId: senderId, 
          text 
        });

        io.to(conversationId).emit('receive_message', newMessage);
      } catch (error) {
        console.error("Error saving message:", error.message);
      }
    });
  });
};

// export const setupChatSocket = (io) => {
//   io.on('connection', (socket) => {
//     console.log("A user connected:", socket.id);

//     socket.on('join_room', (roomId) => {
//       console.log("User joined room:", roomId);
//       socket.join(roomId);
//     });

//     socket.on('send_message', async (data) => {
//     console.log("Received send_message raw data:", data);

//     // If data is a string, parse it. If it's already an object, use it.
//     const payload = typeof data === 'string' ? JSON.parse(data) : data;
    
//     // Destructure from the payload
//     const { conversationId, senderId, text } = payload;

//     console.log("Extracted payload:", { conversationId, senderId, text });

//     try {
//         const newMessage = await Message.create({ 
//         conversationId, 
//         senderId: senderId, 
//         text 
//         });
//         console.log("Message saved successfully:", newMessage);
//         io.to(conversationId).emit('receive_message', newMessage);
//     } catch (error) {
//         console.error("Error saving message to DB:", error.message);
//     }
//     });

//   });
// };


