import express from 'express';
import { createGroup, createContact, getConversations, markAsRead } from '../controllers/chat.controller.js';
import { validateJWT } from '../middlewares/getCurrentUser.js';
import multer from 'multer';
import { storage } from '../config/cloudanaryConfig.js';

let upload;
try {
  upload = multer({ storage });
} catch (e) {
  upload = multer({ storage: multer.memoryStorage() });
}

const safeUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) { console.error('Multer error:', err.message); req.file = null; }
    next();
  });
};

const router = express.Router();

router.get('/conversations',                          validateJWT, getConversations);
router.patch('/conversations/:conversationId/read',   validateJWT, markAsRead);
router.post('/contact', validateJWT, safeUpload('contactImage'), createContact);
router.post('/group',   validateJWT, safeUpload('groupImage'),   createGroup);

export default router;