// import 'dotenv/config';

// import express from 'express';
// import mongoose from 'mongoose';
// import cookieParser from 'cookie-parser';
// import passport from 'passport';
// import './src/config/passport.js';

// // socket io
// import { Server } from 'socket.io';
// import http from 'http';
// import { setupChatSocket } from './src/socket/chat.socket.js';
// import { socketAuth } from './src/middlewares/socket.auth.js';

// const app = express();
// const port = process.env.PORT;


// const server = http.createServer(app);
// // const io = new Server(server, {
// //   cors: { origin: process.env.FRONTEND_URL, credentials: true }
// // });
// const io = new Server(server, {
//     path: "/socket.io/",
// //   cors: {
// //     origin: ["http://localhost:3000" , process.env.FRONTEND_URL], // Hardcoded for testing
// //     methods: ["GET", "POST"]
// //   }
// });
// io.use(socketAuth);
// setupChatSocket(io);


// import UserRoutes from './src/routes/User.routes.js';
// import ChatRoutes from './src/routes/Chat.routes.js';
// import MessageRoutes from './src/routes/message.routes.js';



// app.use(express.json());
// app.use(cookieParser());
// app.use(passport.initialize()); 


// //connection with mongooDB
// async function Main() {
//     // await mongoose.connect("mongodb://127.0.0.1:27017/Car_Dealership");
//     await mongoose.connect(process.env.ATLASDB_URL);
// }
// Main().then(()=>{console.log("Database connected...")}).catch((err)=>{console.log(err)});



// //Routes
// app.use('/users', UserRoutes);
// app.use('/chat', ChatRoutes);
// app.use('/messages', MessageRoutes);    


// // app.listen(port, ()=>{
// //     console.log(`Server running on port ${port}....`)
// // })
// server.listen(port, () => {
//     console.log(`Server running on port ${port}....`);
// });


import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import './src/config/passport.js';

import { Server } from 'socket.io';
import http from 'http';
import { setupChatSocket } from './src/socket/chat.socket.js';
import { socketAuth } from './src/middlewares/socket.auth.js';

import UserRoutes from './src/routes/User.routes.js';
import ChatRoutes from './src/routes/Chat.routes.js';
import MessageRoutes from './src/routes/message.routes.js';

const app = express();
const port = process.env.PORT;

// ── CORS ── must be first
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Middleware ──
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ── Database ──
async function Main() {
  await mongoose.connect(process.env.ATLASDB_URL);
}
Main()
  .then(() => console.log('Database connected...'))
  .catch((err) => console.log(err));

// ── Routes ──
app.use('/users', UserRoutes);
app.use('/chat', ChatRoutes);
app.use('/messages', MessageRoutes);

// ── Socket.IO ──
const server = http.createServer(app);

const io = new Server(server, {
  path: '/socket.io/',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

io.use(socketAuth);
setupChatSocket(io);

// ── Start ──
server.listen(port, () => {
  console.log(`Server running on port ${port}....`);
});