import express from 'express';
import { createGroup, createContact , getConversations} from '../controllers/chat.controller.js';
import { validateDTO } from '../middlewares/validateDTO.js';
import { createGroupDTO , createContactDTO} from '../dtos/chat.dtos.js';
import { validateJWT } from '../middlewares/getCurrentUser.js';
import multer from 'multer';
import { storage } from '../config/cloudanaryConfig.js';
const upload = multer({ storage });

const router = express.Router();

router.post('/group', validateJWT ,validateDTO(createGroupDTO) , upload.single("groupImage"), createGroup);
router.post('/contact', validateJWT, validateDTO(createContactDTO) , upload.single("contactImage"), createContact);
router.get('/conversations', validateJWT, getConversations);

export default router;