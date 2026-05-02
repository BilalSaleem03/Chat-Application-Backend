import jwt from 'jsonwebtoken';

export const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    // Must use ACCESS_TOKEN_SECRET — same secret as generateAccessToken in jwt.js
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded;  // { _id, iat, exp }
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid or expired token'));
  }
};