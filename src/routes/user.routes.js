import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import {validateDTO} from '../middlewares/validateDTO.js';
import { registerUserDTO , loginUserDTO } from '../dtos/user.dtos.js';
import { register, login, logout, googleAuthCallback} from '../controllers/user.controller.js';
import { validateJWT } from '../middlewares/getCurrentUser.js';

const router = express.Router();

router.post('/register',validateDTO(registerUserDTO) ,register);
router.post('/login', validateDTO(loginUserDTO), login);
router.post('/logout', validateJWT ,logout);

// Google Auth Flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuthCallback);


export default router;
