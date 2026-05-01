import express from 'express';
import { getMessages } from '../controllers/message.controller.js';
// import { validateDTO } from '../middlewares/validateDTO.js';
// import { createGroupDTO , createContactDTO} from '../dtos/chat.dtos.js';
import { validateJWT } from '../middlewares/getCurrentUser.js';
// import multer from 'multer';
// import { storage } from '../config/cloudanaryConfig.js';
// const upload = multer({ storage });

const router = express.Router();


router.get('/messages/:conversationId', validateJWT, getMessages);

export default router;