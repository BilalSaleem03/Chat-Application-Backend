import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  logout,
  googleAuthCallback,
  findUserByEmail,
  resetPassword,
} from '../controllers/user.controller.js';
import { validateDTO } from '../middlewares/validateDTO.js';
import { registerUserDTO, loginUserDTO } from '../dtos/user.dtos.js';
import { validateJWT } from '../middlewares/getCurrentUser.js';

const router = express.Router();

router.post('/register',        validateDTO(registerUserDTO), register);
router.post('/login',           validateDTO(loginUserDTO),    login);
router.post('/logout',          validateJWT,                  logout);
router.post('/reset-password',                                resetPassword); // no auth needed
router.get('/find',             validateJWT,                  findUserByEmail);

// Google OAuth
router.get('/google',           passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',  passport.authenticate('google', { session: false }), googleAuthCallback);

export default router;