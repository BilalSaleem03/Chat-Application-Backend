// src/middlewares/socket.auth.js
import jwt from 'jsonwebtoken';

export const socketAuth = (socket, next) => {
  // Client sends token in the auth object
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to socket so it's available in all event handlers
    socket.user = decoded; 
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
};